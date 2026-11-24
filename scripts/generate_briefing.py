import os
from datetime import datetime, timezone, timedelta
import yfinance as yf
from pydantic import BaseModel
from google import genai
from google.genai import types
from supabase import create_client

KST = timezone(timedelta(hours=9))
TODAY_STR = datetime.now(KST).strftime("%Y-%m-%d")

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)
gemini = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


class NewsItem(BaseModel):
    title: str
    source: str
    url: str


class AISummary(BaseModel):
    headline: str
    three_line_summary: list[str]
    sector_flow: str
    curated_links: list[NewsItem]


class KeyMover(BaseModel):
    ticker: str
    name: str
    change_pct: float
    reason: str


class WatchlistComment(BaseModel):
    ticker: str
    name: str
    comment: str


class CalendarEvent(BaseModel):
    date: str
    title: str
    importance: str


class BriefingAIOutput(BaseModel):
    ai_summary: AISummary
    key_movers: list[KeyMover]
    watchlist_comments: list[WatchlistComment]
    calendar_events: list[CalendarEvent]


def fetch_macro_data():
    tickers = {
        "S&P 500": "^GSPC", "NASDAQ": "^IXIC", "DOW": "^DJI",
        "KOSPI": "^KS11", "KOSDAQ": "^KQ11",
        "USD/KRW": "KRW=X", "DXY": "DX-Y.NYB",
        "VIX": "^VIX", "WTI": "CL=F", "US10Y": "^TNX"
    }
    results = []
    for name, symbol in tickers.items():
        hist = yf.Ticker(symbol).history(period="5d")
        if len(hist) >= 2:
            close = float(hist["Close"].iloc[-1])
            prev = float(hist["Close"].iloc[-2])
            change_pct = round(((close - prev) / prev) * 100, 2)
            results.append({
                "name": name, "symbol": symbol,
                "price": round(close, 2), "change_pct": change_pct
            })
    return results


def fetch_watchlist_snapshot():
    res = supabase.table("watchlist").select("*").eq("is_active", True).order("display_order").execute()
    items = []
    for row in res.data:
        hist = yf.Ticker(row["yf_ticker"]).history(period="5d")
        change_pct = 0.0
        if len(hist) >= 2:
            close, prev = float(hist["Close"].iloc[-1]), float(hist["Close"].iloc[-2])
            change_pct = round(((close - prev) / prev) * 100, 2)
        items.append({"ticker": row["yf_ticker"], "name": row["name"], "change_pct": change_pct})
    return items


def main():
    macro_data = fetch_macro_data()
    watchlist_snap = fetch_watchlist_snapshot()
    heatmap_data = []

    prompt = f"""
    기준일: {TODAY_STR} (한국 시간 오전 브리핑)
    아래 확정된 시장 지표와 관심종목 등락률을 바탕으로 한국어 데일리 시장 브리핑을 작성해줘.
    - 매크로 지표: {macro_data}
    - 관심종목 현황: {watchlist_snap}
    - 요구사항: 핵심 3줄 요약, 섹터 강세/약세 흐름, 주요 특징주 5~8개, 관심종목별 한 줄 코멘트, 이번 주 주요 경제·실적 일정을 간결하게 정리할 것.
    """

    response = gemini.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=BriefingAIOutput,
            thinking_config=types.ThinkingConfig(thinking_level="medium"),
        ),
    )
    ai_data = BriefingAIOutput.model_validate_json(response.text).model_dump()

    payload = {
        "briefing_date": TODAY_STR,
        "macro_data": macro_data,
        "heatmap_data": heatmap_data,
        "ai_summary": ai_data["ai_summary"],
        "key_movers": ai_data["key_movers"],
        "watchlist_comments": ai_data["watchlist_comments"],
        "calendar_events": ai_data["calendar_events"],
    }

    supabase.table("daily_briefings").upsert(payload).execute()
    print(f"[{TODAY_STR}] 데일리 브리핑 DB 적재 완료")


if __name__ == "__main__":
    main()
