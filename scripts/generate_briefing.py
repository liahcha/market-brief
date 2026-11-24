import os
import time
from datetime import datetime, timezone, timedelta
import yfinance as yf
from pydantic import BaseModel
from google import genai
from google.genai import types
from supabase import create_client

KST = timezone(timedelta(hours=9))
NOW_KST = datetime.now(KST)
TODAY_STR = NOW_KST.strftime("%Y-%m-%d")

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)
gemini = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

CANDIDATE_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
]


class TakeawayItem(BaseModel):
    title: str
    detail: str


class MediaLink(BaseModel):
    title: str
    source: str
    url: str


class AISummaryV2(BaseModel):
    headline: str
    takeaways: list[TakeawayItem]
    sector_flow: str
    news_links: list[MediaLink]
    youtube_links: list[MediaLink]


class MoverItem(BaseModel):
    ticker: str
    name: str
    market: str
    change_pct: float
    reason: str


class KeyMoversV2(BaseModel):
    gainers: list[MoverItem]
    losers: list[MoverItem]


class WatchlistCommentV2(BaseModel):
    ticker: str
    name: str
    comment: str


class CalendarEvent(BaseModel):
    date: str
    title: str
    importance: str


class BriefingAIOutputV2(BaseModel):
    ai_summary: AISummaryV2
    key_movers: KeyMoversV2
    watchlist_comments: list[WatchlistCommentV2]
    calendar_events: list[CalendarEvent]


def fetch_macro_data():
    tickers = [
        ("sp500",  "S&P 500",            "^GSPC",    ""),
        ("nasdaq", "나스닥 종합 (IXIC)",   "^IXIC",    ""),
        ("dow",    "다우존스 (DJI)",       "^DJI",     ""),
        ("kospi",  "코스피 (KOSPI)",       "^KS11",    ""),
        ("kosdaq", "코스닥 (KOSDAQ)",      "^KQ11",    ""),
        ("usdkrw", "원/달러 환율",         "KRW=X",    "원"),
        ("dxy",    "달러 인덱스 (DXY)",    "DX-Y.NYB", ""),
        ("wti",    "국제유가 (WTI)",       "CL=F",     "$"),
        ("vix",    "변동성지수 (VIX)",     "^VIX",     ""),
        ("us10y",  "미 국채 10년물",       "^TNX",     "%"),
    ]
    results = []
    for key, name, symbol, unit in tickers:
        try:
            hist = yf.Ticker(symbol).history(period="5d")
            if len(hist) >= 2:
                close = float(hist["Close"].iloc[-1])
                prev = float(hist["Close"].iloc[-2])
                diff = round(close - prev, 2)
                change_pct = round((diff / prev) * 100, 2) if prev else 0.0
                arrow = "▲ +" if diff > 0 else ("▼ " if diff < 0 else "")
                if unit == "$":
                    display_val = f"${close:,.2f}"
                elif unit == "원":
                    display_val = f"{close:,.2f}원"
                elif unit == "%":
                    display_val = f"{close:.2f}%"
                else:
                    display_val = f"{close:,.2f}"
                delta_text = f"{arrow}{diff:,.2f} ({'+' if change_pct > 0 else ''}{change_pct:.2f}%)"
                results.append({
                    "key": key,
                    "name": name,
                    "symbol": symbol,
                    "price": round(close, 2),
                    "display_val": display_val,
                    "change_pct": change_pct,
                    "delta_text": delta_text,
                    "note": f"yfinance 최근 마감 ({hist.index[-1].strftime('%m/%d')})",
                })
        except Exception as e:
            print(f"[매크로 수집 건너뜀] {name} ({symbol}): {e}")
    return results


def fetch_watchlist_snapshot():
    res = supabase.table("watchlist").select("*").eq("is_active", True).order("display_order").execute()
    items = []
    for row in res.data:
        close_val = None
        change_pct = 0.0
        try:
            hist = yf.Ticker(row["yf_ticker"]).history(period="5d")
            if len(hist) >= 2:
                close_val = round(float(hist["Close"].iloc[-1]), 2)
                prev_val = float(hist["Close"].iloc[-2])
                change_pct = round(((close_val - prev_val) / prev_val) * 100, 2) if prev_val else 0.0
        except Exception as e:
            print(f"[관심종목 시세 건너뜀] {row['yf_ticker']}: {e}")
        items.append({
            "ticker": row["yf_ticker"],
            "name": row["name"],
            "asset_type": row.get("asset_type", "해외주식"),
            "sector": row.get("sector", "기타"),
            "price": close_val,
            "change_pct": change_pct,
        })
    return items


def build_heatmap_snapshot(watchlist_snap):
    us_items = [w for w in watchlist_snap if w["asset_type"] == "해외주식" and w["price"] is not None]
    tech = [w for w in us_items if w["sector"] == "AI/반도체"]
    bigtech = [w for w in us_items if w["sector"] in ("빅테크", "로보틱스")]
    defensive = [w for w in us_items if w["sector"] in ("배당/인컴", "헬스케어/금융")]
    return {
        "finviz_html": "",
        "sectors": [
            {"title": "AI / 반도체", "badge": "관심종목 스냅샷", "tiles": tech},
            {"title": "빅테크 & 로보틱스", "badge": "성장주 흐름", "tiles": bigtech},
            {"title": "배당 · 헬스케어 · 금융", "badge": "방어/인컴", "tiles": defensive},
        ],
        "summary_bar": f"{TODAY_STR} 관심종목 미국장 마감 종가 스냅샷 (전체 S&P 500은 실시간 히트맵 탭 참조)",
    }


def generate_briefing_with_fallback(prompt: str) -> dict:
    last_error = None
    for model_name in CANDIDATE_MODELS:
        for attempt in range(1, 3):
            try:
                print(f"[AI 호출] 모델: {model_name} (시도 {attempt}/2)")
                response = gemini.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=BriefingAIOutputV2,
                    ),
                )
                print(f"[AI 성공] 사용된 모델: {model_name}")
                return BriefingAIOutputV2.model_validate_json(response.text).model_dump()
            except Exception as e:
                last_error = e
                print(f"[AI 재시도 대기] {model_name} 시도 {attempt} 실패: {e}")
                if attempt < 2:
                    time.sleep(15)
        print(f"[모델 전환] {model_name} 혼잡으로 다음 모델로 전환합니다.")
    raise RuntimeError(f"모든 후보 모델 호출 실패: {last_error}")


def main():
    macro_data = fetch_macro_data()
    watchlist_snap = fetch_watchlist_snapshot()
    heatmap_data = build_heatmap_snapshot(watchlist_snap)

    fx_item = next((m for m in macro_data if m["key"] == "usdkrw"), None)

    prompt = f"""
    기준일: {TODAY_STR} (한국 시간 오전 브리핑)
    아래 확정된 매크로 지표와 관심종목 등락률을 바탕으로 한국어 글로벌 데일리 시장 브리핑을 작성해줘.
    - 매크로 지표: {macro_data}
    - 관심종목 현황: {watchlist_snap}
    - 작성 규칙:
      1) 개인 자산·보유 수량·계좌 표현은 절대 쓰지 말고 순수 공개 시장 관점으로 작성할 것.
      2) takeaways는 핵심 시사점 3개(각각 title, detail)로 작성할 것.
      3) key_movers는 상승 상위 3~4개(gainers)와 하락 상위 3~4개(losers)로 분리하고 한 줄 사유(reason)를 적을 것.
      4) watchlist_comments는 제공된 관심종목별 한 줄 코멘트를 작성할 것.
      5) news_links는 주요 금융 언론/포털(Yahoo Finance, Finviz, 네이버 증권 등 검증된 공개 URL), youtube_links는 한경 글로벌마켓 등 검증된 채널 링크를 제시하고 존재하지 않는 기사 URL을 임의로 지어내지 말 것.
      6) calendar_events는 이번 주 주요 거시경제·실적 일정 3~5건을 정리할 것.
    """

    ai_data = generate_briefing_with_fallback(prompt)

    # AI 요약에 메타데이터 보강
    ai_summary = ai_data["ai_summary"]
    ai_summary["us_date_label"] = "미국 전일 마감 종가 기준"
    ai_summary["kr_date_label"] = "한국 전일 마감 종가 기준"
    ai_summary["fx_val"] = fx_item["display_val"] if fx_item else "-"
    ai_summary["fx_delta"] = fx_item["delta_text"] if fx_item else "-"

    # 관심종목 코멘트에 확정 등락률 병합
    snap_map = {w["ticker"].upper(): w for w in watchlist_snap}
    merged_wl_comments = []
    for c in ai_data["watchlist_comments"]:
        matched = snap_map.get(c["ticker"].upper())
        if matched:
            c["change_pct"] = matched["change_pct"]
            c["price"] = matched["price"]
        merged_wl_comments.append(c)

    payload = {
        "briefing_date": TODAY_STR,
        "macro_data": macro_data,
        "heatmap_data": heatmap_data,
        "ai_summary": ai_summary,
        "key_movers": ai_data["key_movers"],
        "watchlist_comments": merged_wl_comments,
        "calendar_events": ai_data["calendar_events"],
    }

    supabase.table("daily_briefings").upsert(payload).execute()
    print(f"[{TODAY_STR}] 데일리 브리핑 v2 DB 적재 완료")


if __name__ == "__main__":
    main()
