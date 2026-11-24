/* =========================================================
   Market Brief v2 — Supabase 연동 · 월간비교 · 실시간 차트
   ========================================================= */

const DEFAULT_WATCHLIST = [
  { tv_symbol: "NASDAQ:NVDA",  yf_ticker: "NVDA",      name: "엔비디아",             asset_type: "해외주식", sector: "AI/반도체" },
  { tv_symbol: "NASDAQ:GOOGL", yf_ticker: "GOOGL",     name: "알파벳 A",             asset_type: "해외주식", sector: "빅테크" },
  { tv_symbol: "NASDAQ:ASML",  yf_ticker: "ASML",      name: "ASML",                 asset_type: "해외주식", sector: "AI/반도체" },
  { tv_symbol: "NASDAQ:MSFT",  yf_ticker: "MSFT",      name: "마이크로소프트",       asset_type: "해외주식", sector: "빅테크" },
  { tv_symbol: "NASDAQ:TSLA",  yf_ticker: "TSLA",      name: "테슬라",               asset_type: "해외주식", sector: "로보틱스" },
  { tv_symbol: "NASDAQ:AMZN",  yf_ticker: "AMZN",      name: "아마존닷컴",           asset_type: "해외주식", sector: "빅테크" },
  { tv_symbol: "NASDAQ:PLTR",  yf_ticker: "PLTR",      name: "팔란티어 테크",        asset_type: "해외주식", sector: "AI/반도체" },
  { tv_symbol: "NYSE:UNH",     yf_ticker: "UNH",       name: "유나이티드 헬스 그룹", asset_type: "해외주식", sector: "헬스케어/금융" },
  { tv_symbol: "NYSE:BAC",     yf_ticker: "BAC",       name: "뱅크오브아메리카",     asset_type: "해외주식", sector: "헬스케어/금융" },
  { tv_symbol: "NYSE:O",       yf_ticker: "O",         name: "리얼티인컴",           asset_type: "해외주식", sector: "배당/인컴" },
  { tv_symbol: "AMEX:SCHD",    yf_ticker: "SCHD",      name: "SCHD",                 asset_type: "해외주식", sector: "배당/인컴" },
  { tv_symbol: "NYSE:KO",      yf_ticker: "KO",        name: "코카콜라",             asset_type: "해외주식", sector: "배당/인컴" },
  { tv_symbol: "NASDAQ:JEPQ",  yf_ticker: "JEPQ",      name: "JEPQ",                 asset_type: "해외주식", sector: "배당/인컴" },
  { tv_symbol: "KRX:000660",   yf_ticker: "000660.KS", name: "SK하이닉스",           asset_type: "국내주식", sector: "AI/반도체" },
  { tv_symbol: "KRX:005930",   yf_ticker: "005930.KS", name: "삼성전자",             asset_type: "국내주식", sector: "AI/반도체" },
  { tv_symbol: "KRX:379800",   yf_ticker: "379800.KS", name: "KODEX 미국S&P500",     asset_type: "ETF",      sector: "지수/인덱스" },
  { tv_symbol: "KRX:379810",   yf_ticker: "379810.KS", name: "KODEX 미국나스닥100",  asset_type: "ETF",      sector: "지수/인덱스" },
  { tv_symbol: "KRX:411060",   yf_ticker: "411060.KS", name: "ACE KRX금현물",        asset_type: "ETF",      sector: "안전자산" },
  { tv_symbol: "KRX:489250",   yf_ticker: "489250.KS", name: "KODEX 미국배당다우존스", asset_type: "ETF",    sector: "배당/인컴" }
];

const SAMPLE_BRIEFING = {
  briefing_date: "2026-11-24",
  macro_data: [
    { key: "sp500", name: "S&P 500", symbol: "^GSPC", price: 7237.17, display_val: "7,237.17", change_pct: 4.73, delta_text: "▲ +326.78 pt (+4.73%)", note: "미 11/23 마감" },
    { key: "nasdaq", name: "나스닥 종합 (IXIC)", symbol: "^IXIC", price: 24089.56, display_val: "24,089.56", change_pct: 6.51, delta_text: "▲ +1,471.83 pt (+6.51%)", note: "미 11/23 마감" },
    { key: "dow", name: "다우존스 (DJI)", symbol: "^DJI", price: 49595.31, display_val: "49,595.31", change_pct: 3.01, delta_text: "▲ +1,447.98 pt (+3.01%)", note: "미 11/23 마감" },
    { key: "kospi", name: "코스피 (KOSPI)", symbol: "^KS11", price: 4708.54, display_val: "4,708.54", change_pct: -3.31, delta_text: "▼ -161.42 pt (-3.31%)", note: "한국 11/23 마감" },
    { key: "kosdaq", name: "코스닥 (KOSDAQ)", symbol: "^KQ11", price: 635.45, display_val: "635.45", change_pct: -1.58, delta_text: "▼ -10.23 pt (-1.58%)", note: "한국 11/23 마감" },
    { key: "usdkrw", name: "원/달러 환율", symbol: "KRW=X", price: 1345.90, display_val: "1,345.90원", change_pct: 0.73, delta_text: "▲ +9.70원 (+0.73%)", note: "11/23 외환마감" },
    { key: "dxy", name: "달러 인덱스 (DXY)", symbol: "DX-Y.NYB", price: 104.17, display_val: "104.17", change_pct: 0.31, delta_text: "▲ +0.42 pt (+0.31%)", note: "11/23 마감" },
    { key: "wti", name: "국제유가 (WTI)", symbol: "CL=F", price: 80.17, display_val: "$80.17", change_pct: -3.88, delta_text: "▼ -3.88%", note: "NYMEX WTI" },
    { key: "vix", name: "변동성지수 (VIX)", symbol: "^VIX", price: 26.62, display_val: "26.62", change_pct: -25.83, delta_text: "▼ -9.27 pt (-25.83%)", note: "공포심리 급락 안정" },
    { key: "us10y", name: "미 국채 10년물", symbol: "^TNX", price: 4.92, display_val: "4.92%", change_pct: -0.45, delta_text: "▼ -0.45%", note: "샘플 지표" }
  ],
  heatmap_data: { finviz_html: "", sectors: [] },
  ai_summary: {
    headline: "[샘플 미리보기] SQL 초기 적재 또는 워크플로우 실행 시 실제 LIVE DB 데이터로 자동 전환됩니다",
    us_date_label: "미국 전일 마감 종가 기준",
    kr_date_label: "한국 전일 마감 종가 기준",
    fx_val: "1,345.90원",
    fx_delta: "▲ +9.70원 (+0.73%)",
    takeaways: [
      { title: "Supabase DB 연동 준비 완료", detail: "제공된 sql/01_update_watchlist.sql과 sql/02_seed_public_history.sql을 실행하면 19일 치 시황 아카이브와 월간 비교 리포트가 즉시 활성화됩니다." },
      { title: "개인 자산정보 100% 비노출 구조", detail: "5번 섹션의 보유 수량·매입단가·계좌 정보는 공개 영역에서 완전히 배제하고, 관심종목 실시간 차트만 안전하게 표시합니다." },
      { title: "월간 자동 비교(M1/M2) 내장", detail: "좌측 월(Month) 헤더를 클릭하면 Supabase 일별 데이터를 자동 집계해 직전월 대비 매크로 변화와 일별 추이 차트를 보여줍니다." }
    ],
    sector_flow: "기술주·AI 반도체 강세 및 변동성 지수 안정화 흐름이 나타난 샘플 미리보기입니다.",
    news_links: [
      { title: "Finviz S&P 500 실시간 히트맵 바로가기", source: "Finviz", url: "https://finviz.com/map.ashx" },
      { title: "Yahoo Finance 글로벌 시장 주요 뉴스", source: "Yahoo Finance", url: "https://finance.yahoo.com/" }
    ],
    youtube_links: [
      { title: "한경 글로벌마켓 유튜브 공식 채널", source: "한경 글로벌마켓", url: "https://www.youtube.com/@hkglobalmarket" }
    ]
  },
  key_movers: {
    gainers: [
      { ticker: "NVDA", name: "엔비디아 (NVDA)", market: "해외주식", change_pct: 31.48, reason: "샘플 미리보기 — DB 적재 시 당일 실제 주도주와 사유가 표시됩니다." },
      { ticker: "TSLA", name: "테슬라 (TSLA)", market: "해외주식", change_pct: 11.46, reason: "샘플 미리보기 — 나스닥 강세 동조 반등" }
    ],
    losers: [
      { ticker: "005930", name: "삼성전자 (005930)", market: "국내주식", change_pct: -3.06, reason: "샘플 미리보기 — 전일 국내장 조정 반영" },
      { ticker: "KO", name: "코카콜라 (KO)", market: "해외주식", change_pct: -1.14, reason: "샘플 미리보기 — 방어주 차익실현 매물" }
    ]
  },
  watchlist_comments: [],
  calendar_events: [
    { date: "2026-11-26", title: "미국 근원 개인소비지출(PCE) 물가지수 발표", importance: "HIGH" },
    { date: "2026-11-27", title: "한국은행 금융통화위원회 기준금리 결정", importance: "HIGH" }
  ]
};

// ---------------- 앱 전역 상태 ----------------
const state = {
  supabase: null,
  availableDates: [],
  allMacroByDate: {}, // 월간 비교용 경량 캐시
  currentDate: null,
  currentBriefing: null,
  currentView: "daily", // "daily" | "monthly"
  currentMonthKey: null,
  monthlyChartIndicator: "sp500",
  heatmapMode: "live", // "live" | "snapshot"
  watchlist: [...DEFAULT_WATCHLIST],
  wlTypeFilter: "all",
  wlSectorFilter: "all",
  selectedWatchlistTicker: "NVDA",
  isSampleMode: false,
  theme: localStorage.getItem("mb_theme") || "dark",
  marketColor: localStorage.getItem("mb_market_color") || "us"
};

// ---------------- 유틸리티 ----------------
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(url) {
  if (typeof url !== "string") return "#";
  const t = url.trim();
  return t.startsWith("https://") || t.startsWith("http://") ? t : "#";
}

function getWeekdayLabel(dateStr) {
  if (!dateStr) return "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${dateStr} (${days[d.getDay()]})`;
}

function formatNum(n, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "-";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function deltaClass(pct, invertForVix = false) {
  const n = Number(pct);
  if (Number.isNaN(n) || n === 0) return "flat";
  const isPositive = invertForVix ? n < 0 : n > 0;
  return isPositive ? "up" : "down";
}

function normalizeMacroKey(item) {
  if (item.key) return item.key;
  const sym = (item.symbol || "").toUpperCase();
  const name = (item.name || "").toUpperCase();
  if (sym === "^GSPC" || name.includes("S&P")) return "sp500";
  if (sym === "^IXIC" || name.includes("NASDAQ") || name.includes("나스닥")) return "nasdaq";
  if (sym === "^DJI" || name.includes("DOW") || name.includes("다우")) return "dow";
  if (sym === "^KS11" || name.includes("KOSPI") || name.includes("코스피")) return "kospi";
  if (sym === "^KQ11" || name.includes("KOSDAQ") || name.includes("코스닥")) return "kosdaq";
  if (sym === "KRW=X" || name.includes("USD/KRW") || name.includes("환율")) return "usdkrw";
  if (sym === "DX-Y.NYB" || name.includes("DXY") || name.includes("달러 인덱스")) return "dxy";
  if (sym === "CL=F" || name.includes("WTI") || name.includes("유가")) return "wti";
  if (sym === "^VIX" || name.includes("VIX") || name.includes("변동성")) return "vix";
  if (sym === "^TNX" || name.includes("10Y") || name.includes("국채")) return "us10y";
  return name;
}

// ---------------- 테마 & 색상 ----------------
function applyPreferences() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.documentElement.setAttribute("data-market-color", state.marketColor);

  const icon = document.getElementById("theme-icon");
  if (icon) {
    icon.className = state.theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }

  const colorBtn = document.getElementById("color-scheme-btn");
  if (colorBtn) {
    colorBtn.textContent = state.marketColor === "kr" ? "KR 색상" : "US 색상";
  }
}

function setStatusBadge(type, text) {
  const el = document.getElementById("db-status-badge");
  if (!el) return;
  el.className = `status-badge ${type}`;
  el.textContent = text;
}

function showNotice(htmlText) {
  const banner = document.getElementById("notice-banner");
  const textEl = document.getElementById("notice-text");
  if (!banner || !textEl) return;
  textEl.innerHTML = htmlText;
  banner.classList.remove("hidden");
}

function hideNotice() {
  document.getElementById("notice-banner")?.classList.add("hidden");
}

// ---------------- Supabase 초기화 & 부트스트랩 ----------------
function initSupabase() {
  const cfg = window.APP_CONFIG || {};
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_PUBLISHABLE_KEY) return null;
  return window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY);
}

async function bootstrapData() {
  setStatusBadge("loading", "DB 조회 중...");
  state.supabase = initSupabase();

  if (!state.supabase) {
    activateSampleMode("Supabase 설정(js/config.js)을 확인할 수 없어 <strong>샘플 미리보기</strong>를 표시합니다.");
    return;
  }

  try {
    // 1. 관심종목 조회 (asset_type, sector 컬럼 지원)
    const wlRes = await state.supabase
      .from("watchlist")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!wlRes.error && Array.isArray(wlRes.data) && wlRes.data.length > 0) {
      state.watchlist = wlRes.data.map((r) => ({
        tv_symbol: r.tv_symbol,
        yf_ticker: r.yf_ticker,
        name: r.name,
        asset_type: r.asset_type || inferAssetType(r.tv_symbol),
        sector: r.sector || "기타"
      }));
      if (!state.watchlist.some((w) => w.yf_ticker === state.selectedWatchlistTicker)) {
        state.selectedWatchlistTicker = state.watchlist[0].yf_ticker;
      }
    }

    // 2. 전체 일자 + 매크로 경량 조회 (아카이브 + 월간 비교 리포트 자동 계산용)
    const listRes = await state.supabase
      .from("daily_briefings")
      .select("briefing_date, macro_data")
      .order("briefing_date", { ascending: false });

    if (listRes.error) throw listRes.error;

    const rows = listRes.data || [];
    state.availableDates = rows.map((r) => r.briefing_date);
    state.allMacroByDate = {};
    rows.forEach((r) => {
      state.allMacroByDate[r.briefing_date] = r.macro_data || [];
    });

    if (state.availableDates.length === 0) {
      activateSampleMode(
        "수파베이스 연결은 정상입니다. 다만 <code>daily_briefings</code> 테이블에 데이터가 아직 없어 <strong>샘플 미리보기</strong>를 표시합니다. <code>sql/02_seed_public_history.sql</code>을 실행하거나 워크플로우를 1회 성공시키면 즉시 LIVE DB로 전환됩니다."
      );
      return;
    }

    state.isSampleMode = false;
    setStatusBadge("live", `LIVE DB (${state.availableDates.length}일)`);
    hideNotice();
    state.currentDate = state.availableDates[0];
    renderArchiveSidebar(state.availableDates);
    await loadBriefingByDate(state.availableDates[0]);
  } catch (err) {
    console.error("Supabase 로드 오류:", err);
    activateSampleMode(
      `수파베이스 조회 오류로 <strong>샘플 미리보기</strong>를 표시합니다. (${escapeHtml(err.message || String(err))})`
    );
  }
}

function inferAssetType(tvSymbol) {
  if (!tvSymbol) return "해외주식";
  if (tvSymbol.startsWith("KRX:")) return "국내주식";
  return "해외주식";
}

function activateSampleMode(messageHtml) {
  state.isSampleMode = true;
  state.availableDates = [SAMPLE_BRIEFING.briefing_date];
  state.allMacroByDate = { [SAMPLE_BRIEFING.briefing_date]: SAMPLE_BRIEFING.macro_data };
  state.currentDate = SAMPLE_BRIEFING.briefing_date;
  state.currentBriefing = SAMPLE_BRIEFING;

  setStatusBadge("sample", "샘플 미리보기");
  showNotice(messageHtml);
  renderArchiveSidebar(state.availableDates);
  renderFullBriefing(SAMPLE_BRIEFING);
}

async function loadBriefingByDate(dateStr) {
  showDailyView();
  if (state.isSampleMode) {
    renderFullBriefing(SAMPLE_BRIEFING);
    return;
  }

  try {
    const { data, error } = await state.supabase
      .from("daily_briefings")
      .select("*")
      .eq("briefing_date", dateStr)
      .single();

    if (error) throw error;

    state.currentDate = dateStr;
    state.currentBriefing = data;
    highlightSidebarSelection();
    renderFullBriefing(data);
    closeMobileSidebar();
  } catch (err) {
    console.error("상세 조회 실패:", err);
    showNotice(`해당 날짜(${escapeHtml(dateStr)}) 로드 실패: ${escapeHtml(err.message || err)}`);
  }
}

// ---------------- 뷰 전환 (일간 vs 월간) ----------------
function showDailyView() {
  state.currentView = "daily";
  document.getElementById("dailyBriefingView")?.classList.remove("hidden");
  document.getElementById("monthlyComparisonView")?.classList.add("hidden");
  highlightSidebarSelection();
}

function openMonthlyReport(monthKey) {
  state.currentView = "monthly";
  state.currentMonthKey = monthKey;
  document.getElementById("dailyBriefingView")?.classList.add("hidden");
  document.getElementById("monthlyComparisonView")?.classList.remove("hidden");

  // 해당 월 아코디언 자동 펼침
  const box = document.getElementById(`monthGroupBox_${monthKey}`);
  if (box) box.classList.remove("collapsed");

  highlightSidebarSelection();
  renderMonthlyComparison(monthKey);
  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------------- 좌측 아카이브 사이드바 ----------------
function renderArchiveSidebar(dates, filterText = "") {
  const tree = document.getElementById("archive-tree");
  const countEl = document.getElementById("archive-count");
  if (!tree) return;

  const filtered = filterText ? dates.filter((d) => d.includes(filterText.trim())) : dates;
  if (countEl) countEl.textContent = `${filtered.length} Days`;

  if (!filtered.length) {
    tree.innerHTML = `<div class="empty-inline">일치하는 브리핑이 없습니다.</div>`;
    return;
  }

  const groups = {};
  filtered.forEach((d) => {
    const ym = d.slice(0, 7);
    if (!groups[ym]) groups[ym] = [];
    groups[ym].push(d);
  });

  const months = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  const latestOverall = dates[0];

  tree.innerHTML = months
    .map((ym, idx) => {
      const [year, month] = ym.split("-");
      const mDates = groups[ym];
      const minD = mDates[mDates.length - 1].slice(5).replace("-", "/");
      const maxD = mDates[0].slice(5).replace("-", "/");
      const collapsed = idx > 0 ? "collapsed" : "";

      const itemsHtml = mDates
        .map((d) => {
          const isLatest = d === latestOverall;
          return `
            <button class="date-item-btn" data-date="${escapeHtml(d)}">
              <span><i class="fa-regular fa-calendar-check" style="margin-right:5px;font-size:10px;"></i>${escapeHtml(getWeekdayLabel(d))}</span>
              ${isLatest ? `<span class="date-tag-today">Today</span>` : `<span class="date-tag-hist">Hist</span>`}
            </button>
          `;
        })
        .join("");

      return `
        <div class="month-box ${collapsed}" id="monthGroupBox_${escapeHtml(ym)}" data-month="${escapeHtml(ym)}">
          <div class="month-head-row">
            <button class="month-select-btn" data-month="${escapeHtml(ym)}" title="클릭 시 직전월 vs ${escapeHtml(year)}년 ${escapeHtml(month)}월 매크로 트렌드 비교 보기">
              <i class="fa-solid fa-folder-open text-blue" style="font-size:12px;"></i>
              <div>
                <div class="month-title-line">
                  <span>${escapeHtml(year)}년 ${Number(month)}월</span>
                  <span class="month-cnt">${mDates.length}</span>
                </div>
                <div class="month-sub">${escapeHtml(minD)} ~ ${escapeHtml(maxD)} · 월간비교 보기</div>
              </div>
            </button>
            <button class="month-chev-btn" data-toggle-month="${escapeHtml(ym)}" title="일별 목록 접기/펼치기">
              <i class="fa-solid fa-chevron-down"></i>
            </button>
          </div>
          <div class="month-dates">${itemsHtml}</div>
        </div>
      `;
    })
    .join("");

  // 월 헤더 클릭 → 월간 비교 리포트
  tree.querySelectorAll(".month-select-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      openMonthlyReport(btn.getAttribute("data-month"));
    });
  });

  // 쉐브론 클릭 → 아코디언 토글
  tree.querySelectorAll(".month-chev-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const ym = btn.getAttribute("data-toggle-month");
      document.getElementById(`monthGroupBox_${ym}`)?.classList.toggle("collapsed");
    });
  });

  // 날짜 클릭 → 일간 브리핑 로드
  tree.querySelectorAll(".date-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-date");
      if (target) loadBriefingByDate(target);
    });
  });

  highlightSidebarSelection();
}

function highlightSidebarSelection() {
  document.querySelectorAll(".month-box").forEach((box) => {
    const ym = box.getAttribute("data-month");
    const isActive = state.currentView === "monthly" && ym === state.currentMonthKey;
    box.classList.toggle("active-month", isActive);
  });

  document.querySelectorAll(".date-item-btn").forEach((btn) => {
    const d = btn.getAttribute("data-date");
    btn.classList.toggle("active", state.currentView === "daily" && d === state.currentDate);
  });
}

// ---------------- 일간 브리핑 전체 렌더링 ----------------
function renderFullBriefing(data) {
  if (!data) return;

  const isLatest = data.briefing_date === state.availableDates[0];
  const macroList = Array.isArray(data.macro_data) ? data.macro_data : [];
  const summary = data.ai_summary || {};

  // 상단 헤더
  const dateEl = document.getElementById("displayHeaderDate");
  const badgeEl = document.getElementById("displayBadge");
  const tagsEl = document.getElementById("displayTimezoneTags");
  const headlineEl = document.getElementById("heroHeadlineText");

  if (dateEl) dateEl.textContent = getWeekdayLabel(data.briefing_date);
  if (badgeEl) {
    badgeEl.textContent = isLatest ? "Today" : "Archived";
    badgeEl.className = `hero-badge ${isLatest ? "today" : "archived"}`;
  }
  if (tagsEl) {
    const usTag = summary.us_date_label || "미국 전일 마감 종가 기준";
    const krTag = summary.kr_date_label || "한국 전일 마감 종가 기준";
    tagsEl.innerHTML = `
      <span class="pill blue">${escapeHtml(usTag)}</span>
      <span class="pill slate">${escapeHtml(krTag)}</span>
      <span class="pill emerald">${state.isSampleMode ? "샘플 미리보기" : "Supabase LIVE 연동"}</span>
    `;
  }
  if (headlineEl) {
    headlineEl.textContent = summary.headline || "";
  }

  // 환율 강조 카드
  const fxItem = macroList.find((m) => normalizeMacroKey(m) === "usdkrw");
  const fxValEl = document.getElementById("displayFxVal");
  const fxDeltaEl = document.getElementById("displayFxDelta");
  if (fxValEl) {
    fxValEl.textContent = summary.fx_val || fxItem?.display_val || (fxItem ? `${formatNum(fxItem.price)}원` : "-");
  }
  if (fxDeltaEl) {
    fxDeltaEl.textContent =
      summary.fx_delta ||
      fxItem?.delta_text ||
      (fxItem ? `${fxItem.change_pct > 0 ? "▲ +" : fxItem.change_pct < 0 ? "▼ " : ""}${formatNum(fxItem.change_pct)}%` : "-");
  }

  // 6대 공개 섹션
  renderHeatmapSection(data.heatmap_data);
  renderMacroSection(macroList);
  renderSummarySection(summary);
  renderKeyMoversSection(data.key_movers);
  renderWatchlistSection(data.watchlist_comments || []);
  renderCalendarSection(data.calendar_events || []);
}

// 1. Finviz S&P 500 Map (실시간 히트맵 + 스냅샷 타일맵)
function renderHeatmapSection(heatmapData) {
  const hasSnapshotHtml = Boolean(heatmapData && typeof heatmapData === "object" && heatmapData.finviz_html);
  const hasSnapshotSectors = Boolean(heatmapData && typeof heatmapData === "object" && Array.isArray(heatmapData.sectors) && heatmapData.sectors.length > 0);
  const hasSnapshot = hasSnapshotHtml || hasSnapshotSectors;

  // 과거 아카이브 조회 시 스냅샷이 있으면 스냅샷 탭 활성화 유도 가능, 기본은 현재 선택된 모드 유지
  const livePanel = document.getElementById("heatmap-live-panel");
  const snapPanel = document.getElementById("heatmap-snapshot-panel");
  const snapContainer = document.getElementById("finvizSnapshotContainer");

  document.querySelectorAll("#heatmap-mode-tabs .seg-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-mode") === state.heatmapMode);
  });

  if (state.heatmapMode === "snapshot") {
    livePanel?.classList.add("hidden");
    snapPanel?.classList.remove("hidden");
    if (snapContainer) {
      if (hasSnapshotHtml) {
        snapContainer.innerHTML = heatmapData.finviz_html;
      } else if (hasSnapshotSectors) {
        snapContainer.innerHTML = renderStructuredFinvizTiles(heatmapData);
      } else {
        snapContainer.innerHTML = `<div class="md:col-span-12 empty-inline">해당 일자의 정적 타일 스냅샷이 없습니다. 상단 <b>실시간 히트맵</b> 탭을 이용하세요.</div>`;
      }
    }
  } else {
    snapPanel?.classList.add("hidden");
    livePanel?.classList.remove("hidden");
    renderTradingViewHeatmap();
  }
}

function renderStructuredFinvizTiles(heatmapData) {
  const sectors = heatmapData.sectors || [];
  const colSpans = ["md:col-span-5", "md:col-span-4", "md:col-span-3"];
  const blocks = sectors.slice(0, 3).map((sec, idx) => {
    const spanCls = colSpans[idx] || "md:col-span-4";
    const tilesHtml = (sec.tiles || [])
      .map((t) => {
        const pct = Number(t.change_pct || 0);
        let tileCls = "finviz-gain-light";
        if (pct >= 3) tileCls = "finviz-gain-deep";
        else if (pct > 0.8) tileCls = "finviz-gain";
        else if (pct > 0) tileCls = "finviz-gain-light";
        else if (pct <= -3) tileCls = "finviz-loss-deep";
        else if (pct < -0.8) tileCls = "finviz-loss";
        else tileCls = "finviz-loss-light";
        const sign = pct > 0 ? "+" : "";
        return `
          <div class="finviz-tile ${tileCls}">
            <span class="text-xs">${escapeHtml(t.ticker)}</span>
            <span class="text-[10px]">${sign}${pct.toFixed(2)}%${t.price ? ` ($${formatNum(t.price)})` : ""}</span>
          </div>
        `;
      })
      .join("");
    return `
      <div class="${spanCls}">
        <div class="flex justify-between items-center border-b">
          <span>${escapeHtml(sec.title)}</span>
          <span>${escapeHtml(sec.badge || "")}</span>
        </div>
        <div class="grid grid-cols-2">${tilesHtml}</div>
      </div>
    `;
  });

  if (heatmapData.summary_bar) {
    blocks.push(`
      <div class="md:col-span-12 flex justify-between items-center">
        <span>${escapeHtml(heatmapData.summary_bar)}</span>
      </div>
    `);
  }
  return blocks.join("");
}

function renderTradingViewHeatmap() {
  const container = document.getElementById("heatmap-live-panel");
  if (!container) return;

  container.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "tradingview-widget-container";
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";

  const widgetDiv = document.createElement("div");
  widgetDiv.className = "tradingview-widget-container__widget";
  wrapper.appendChild(widgetDiv);

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
  script.async = true;
  script.textContent = JSON.stringify({
    exchanges: [],
    dataSource: "SPX500",
    grouping: "sector",
    blockSize: "market_cap_basic",
    blockColor: "change",
    locale: "kr",
    symbolUrl: "",
    colorTheme: state.theme === "dark" ? "dark" : "light",
    hasTopBar: false,
    isDataSetEnabled: false,
    isZoomEnabled: true,
    hasSymbolTooltip: true,
    isMonoSize: false,
    width: "100%",
    height: "100%"
  });

  wrapper.appendChild(script);
  container.appendChild(wrapper);
}

// 2. 글로벌 주요 증시 및 매크로 지표
function renderMacroSection(macroList) {
  const grid = document.getElementById("macro-grid");
  if (!grid) return;

  if (!macroList.length) {
    grid.innerHTML = `<div class="empty-inline">매크로 지표 데이터가 없습니다.</div>`;
    return;
  }

  grid.innerHTML = macroList
    .map((item) => {
      const key = normalizeMacroKey(item);
      const isVix = key === "vix";
      const cls = deltaClass(item.change_pct, isVix);
      const valText = item.display_val || formatNum(item.price);
      const pct = Number(item.change_pct || 0);
      const fallbackDelta = `${pct > 0 ? "▲ +" : pct < 0 ? "▼ " : ""}${pct.toFixed(2)}%`;
      const deltaText = item.delta_text || fallbackDelta;
      const noteText = item.note || item.symbol || "";

      return `
        <div class="glass-card macro-card">
          <div class="macro-name">${escapeHtml(item.name)}</div>
          <div class="macro-val mono">${escapeHtml(valText)}</div>
          <div class="macro-delta mono ${cls}">${escapeHtml(deltaText)}</div>
          <div class="macro-note" title="${escapeHtml(noteText)}">${escapeHtml(noteText)}</div>
        </div>
      `;
    })
    .join("");
}

// 3. 시장 주요 특징 (3대 핵심 시사점 + 뉴스 & 유튜브)
function renderSummarySection(summary) {
  const tkEl = document.getElementById("takeawaysContainer");
  const flowWrap = document.getElementById("sectorFlowWrapper");
  const flowText = document.getElementById("sectorFlowText");
  const newsEl = document.getElementById("newsLinksContainer");
  const ytEl = document.getElementById("youtubeLinksContainer");

  // 3대 핵심 시사점 (신규 takeaways 구조 & 구 three_line_summary 호환)
  let takeaways = Array.isArray(summary.takeaways) ? summary.takeaways : [];
  if (!takeaways.length && Array.isArray(summary.three_line_summary)) {
    takeaways = summary.three_line_summary.map((line, i) => ({
      title: `핵심 포인트 ${i + 1}`,
      detail: line
    }));
  }

  if (tkEl) {
    tkEl.innerHTML = takeaways.length
      ? takeaways
          .map(
            (t, idx) => `
          <div class="glass-card takeaway-card">
            <div class="takeaway-head">
              <span class="takeaway-num">${idx + 1}</span>
              <div class="takeaway-title">${escapeHtml(t.title)}</div>
            </div>
            <p class="takeaway-body">${escapeHtml(t.detail)}</p>
          </div>
        `
          )
          .join("")
      : `<div class="glass-card empty-inline">핵심 시사점 데이터가 없습니다.</div>`;
  }

  // 섹터 흐름
  if (flowWrap && flowText) {
    if (summary.sector_flow && summary.sector_flow.trim()) {
      flowText.textContent = summary.sector_flow;
      flowWrap.classList.remove("hidden");
    } else {
      flowWrap.classList.add("hidden");
    }
  }

  // 뉴스 & 유튜브 링크 분리 (신규 필드 우선, 없으면 curated_links에서 자동 분리)
  let newsLinks = Array.isArray(summary.news_links) ? summary.news_links : [];
  let ytLinks = Array.isArray(summary.youtube_links) ? summary.youtube_links : [];

  if (!newsLinks.length && !ytLinks.length && Array.isArray(summary.curated_links)) {
    summary.curated_links.forEach((l) => {
      const u = (l.url || "").toLowerCase();
      if (u.includes("youtube.com") || u.includes("youtu.be") || (l.source || "").includes("유튜브") || (l.source || "").includes("글로벌마켓")) {
        ytLinks.push(l);
      } else {
        newsLinks.push(l);
      }
    });
  }

  if (newsEl) {
    newsEl.innerHTML = newsLinks.length
      ? newsLinks
          .map(
            (l) => `
          <a class="media-link" href="${escapeHtml(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer">
            <div class="media-link-left">
              <i class="fa-regular fa-newspaper"></i>
              <span class="media-link-title">${escapeHtml(l.title || l.url)}</span>
            </div>
            <span class="media-source mono">${escapeHtml(l.source || "News")}</span>
          </a>
        `
          )
          .join("")
      : `<div class="empty-inline">등록된 언론 보도가 없습니다.</div>`;
  }

  if (ytEl) {
    ytEl.innerHTML = ytLinks.length
      ? ytLinks
          .map(
            (l) => `
          <a class="media-link" href="${escapeHtml(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer">
            <div class="media-link-left">
              <i class="fa-brands fa-youtube text-red"></i>
              <span class="media-link-title">${escapeHtml(l.title || l.url)}</span>
            </div>
            <span class="media-source yt">${escapeHtml(l.source || "YouTube")}</span>
          </a>
        `
          )
          .join("")
      : `<div class="empty-inline">등록된 시황 유튜브 링크가 없습니다.</div>`;
  }
}

// 4. 핵심 특징주 (상승 / 하락 2열)
function renderKeyMoversSection(keyMovers) {
  const gainEl = document.getElementById("gainersContainer");
  const loseEl = document.getElementById("losersContainer");

  let gainers = [];
  let losers = [];

  if (Array.isArray(keyMovers)) {
    gainers = keyMovers.filter((m) => Number(m.change_pct || 0) >= 0).sort((a, b) => b.change_pct - a.change_pct);
    losers = keyMovers.filter((m) => Number(m.change_pct || 0) < 0).sort((a, b) => a.change_pct - b.change_pct);
  } else if (keyMovers && typeof keyMovers === "object") {
    gainers = Array.isArray(keyMovers.gainers) ? keyMovers.gainers : [];
    losers = Array.isArray(keyMovers.losers) ? keyMovers.losers : [];
  }

  const renderCard = (m, type) => {
    const pct = Number(m.change_pct || 0);
    const pctStr = m.delta_text || `${pct > 0 ? "+" : ""}${pct.toFixed(2)}%`;
    const cls = type === "up" ? "up" : "down";
    const marketTag = m.market ? `<span class="mover-market">${escapeHtml(m.market)}</span>` : "";
    const priceTag = m.price ? `<span class="mover-market mono">${escapeHtml(String(m.price))}</span>` : "";
    return `
      <div class="mover-card">
        <div class="mover-top">
          <div>
            <span class="mover-name">${escapeHtml(m.name || m.ticker)}</span>
            ${marketTag}
          </div>
          <div class="mono">
            <span class="mover-pct ${cls}">${escapeHtml(pctStr)}</span>
            ${priceTag}
          </div>
        </div>
        <div class="mover-note">
          <i class="fa-solid fa-angle-right ${cls === "up" ? "text-blue" : "text-red"}"></i>
          <span>${escapeHtml(m.reason || "-")}</span>
        </div>
      </div>
    `;
  };

  if (gainEl) {
    gainEl.innerHTML = gainers.length
      ? gainers.map((m) => renderCard(m, "up")).join("")
      : `<div class="empty-inline">상승 특징주 데이터가 없습니다.</div>`;
  }

  if (loseEl) {
    loseEl.innerHTML = losers.length
      ? losers.map((m) => renderCard(m, "down")).join("")
      : `<div class="empty-inline">하락 특징주 데이터가 없습니다.</div>`;
  }
}

// 5. 관심종목 실시간 추이 (자산군·섹터 다중 필터 + TradingView 실시간 차트)
function renderWatchlistSection(comments) {
  const list = state.watchlist.length ? state.watchlist : DEFAULT_WATCHLIST;

  // 필터 옵션 동적 추출
  const types = ["all", ...Array.from(new Set(list.map((w) => w.asset_type || "해외주식")))];
  const sectors = ["all", ...Array.from(new Set(list.map((w) => w.sector || "기타")))];

  const typeBox = document.getElementById("wl-type-filters");
  if (typeBox) {
    typeBox.innerHTML = types
      .map(
        (t) => `
        <button class="filter-chip ${state.wlTypeFilter === t ? "active" : ""}" data-wl-type="${escapeHtml(t)}">
          ${t === "all" ? "전체" : escapeHtml(t)}
        </button>
      `
      )
      .join("");
    typeBox.querySelectorAll("[data-wl-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.wlTypeFilter = btn.getAttribute("data-wl-type");
        renderWatchlistSection(comments);
      });
    });
  }

  const sectorBox = document.getElementById("wl-sector-filters");
  if (sectorBox) {
    sectorBox.innerHTML = sectors
      .map(
        (s) => `
        <button class="filter-chip ${state.wlSectorFilter === s ? "active-sector" : ""}" data-wl-sector="${escapeHtml(s)}">
          ${s === "all" ? "전체 섹터" : escapeHtml(s)}
        </button>
      `
      )
      .join("");
    sectorBox.querySelectorAll("[data-wl-sector]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.wlSectorFilter = btn.getAttribute("data-wl-sector");
        renderWatchlistSection(comments);
      });
    });
  }

  // 필터 적용
  const filtered = list.filter((item) => {
    const okType = state.wlTypeFilter === "all" || item.asset_type === state.wlTypeFilter;
    const okSector = state.wlSectorFilter === "all" || item.sector === state.wlSectorFilter;
    return okType && okSector;
  });

  const countLabel = document.getElementById("watchlistCountLabel");
  if (countLabel) {
    countLabel.textContent = `표시: ${filtered.length} / ${list.length} 관심종목`;
  }

  const tabsEl = document.getElementById("watchlist-tabs");
  const gridEl = document.getElementById("watchlist-comments-grid");
  const highlightEl = document.getElementById("selected-watchlist-comment");

  if (!filtered.length) {
    if (tabsEl) tabsEl.innerHTML = `<div class="empty-inline">선택한 조건에 해당하는 관심종목이 없습니다.</div>`;
    if (gridEl) gridEl.innerHTML = "";
    return;
  }

  let selected = filtered.find((w) => w.yf_ticker === state.selectedWatchlistTicker);
  if (!selected) {
    selected = filtered[0];
    state.selectedWatchlistTicker = selected.yf_ticker;
  }

  if (tabsEl) {
    tabsEl.innerHTML = filtered
      .map(
        (item) => `
        <button class="watchlist-chip ${item.yf_ticker === selected.yf_ticker ? "active" : ""}" data-ticker="${escapeHtml(item.yf_ticker)}">
          <span>${escapeHtml(item.name)}</span>
          <span class="chip-ticker">${escapeHtml(item.yf_ticker.replace(".KS", ""))}</span>
        </button>
      `
      )
      .join("");

    tabsEl.querySelectorAll(".watchlist-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedWatchlistTicker = btn.getAttribute("data-ticker");
        renderWatchlistSection(comments);
      });
    });
  }

  renderWatchlistChartWidget(selected);

  const matchedSelected = findCommentForWatchlist(selected, comments);
  if (highlightEl) {
    const pctPart =
      matchedSelected && matchedSelected.change_pct !== undefined
        ? ` <span class="mono mover-pct ${deltaClass(matchedSelected.change_pct)}">(${matchedSelected.change_pct > 0 ? "+" : ""}${Number(matchedSelected.change_pct).toFixed(2)}%)</span>`
        : "";
    highlightEl.innerHTML = `
      <strong>${escapeHtml(selected.name)} (${escapeHtml(selected.yf_ticker)})</strong>
      <span class="mover-market">[${escapeHtml(selected.asset_type)} · ${escapeHtml(selected.sector)}]</span>${pctPart}<br/>
      <span>${escapeHtml(matchedSelected ? matchedSelected.comment : "상단 차트에서 실시간 가격 흐름을 확인할 수 있습니다. (당일 AI 종목 코멘트는 자동 브리핑 실행 시 반영됩니다.)")}</span>
    `;
  }

  if (gridEl) {
    gridEl.innerHTML = filtered
      .map((item) => {
        const matched = findCommentForWatchlist(item, comments);
        const pctHtml =
          matched && matched.change_pct !== undefined
            ? `<span class="mono mover-pct ${deltaClass(matched.change_pct)}">${matched.change_pct > 0 ? "+" : ""}${Number(matched.change_pct).toFixed(2)}%</span>`
            : `<span class="mono" style="font-size:11px;color:var(--text-muted);">${escapeHtml(item.yf_ticker.replace(".KS", ""))}</span>`;
        return `
          <div class="wl-card ${item.yf_ticker === selected.yf_ticker ? "selected" : ""}" data-ticker="${escapeHtml(item.yf_ticker)}">
            <div class="wl-card-top">
              <span class="wl-card-title">${escapeHtml(item.name)}</span>
              ${pctHtml}
            </div>
            <div class="wl-card-meta">${escapeHtml(item.asset_type)} · ${escapeHtml(item.sector)}</div>
            <div class="wl-card-body">${escapeHtml(matched ? matched.comment : "클릭하여 실시간 차트 보기")}</div>
          </div>
        `;
      })
      .join("");

    gridEl.querySelectorAll(".wl-card").forEach((card) => {
      card.addEventListener("click", () => {
        state.selectedWatchlistTicker = card.getAttribute("data-ticker");
        renderWatchlistSection(comments);
      });
    });
  }
}

function findCommentForWatchlist(item, comments) {
  if (!Array.isArray(comments)) return null;
  const target = (item.yf_ticker || "").toUpperCase();
  const base = target.split(".")[0];
  return comments.find((c) => {
    const ct = (c.ticker || "").toUpperCase();
    return ct === target || ct.split(".")[0] === base || c.name === item.name;
  });
}

function renderWatchlistChartWidget(item) {
  const container = document.getElementById("watchlist-chart-container");
  if (!container || !item) return;

  container.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "tradingview-widget-container";
  wrapper.style.width = "100%";
  wrapper.style.height = "100%";

  const widgetDiv = document.createElement("div");
  widgetDiv.className = "tradingview-widget-container__widget";
  wrapper.appendChild(widgetDiv);

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
  script.async = true;
  script.textContent = JSON.stringify({
    symbols: [[item.name, `${item.tv_symbol}|1M`]],
    chartOnly: false,
    width: "100%",
    height: "100%",
    locale: "kr",
    colorTheme: state.theme === "dark" ? "dark" : "light",
    autosize: true,
    showVolume: true,
    showMA: false,
    hideDateRanges: false,
    hideMarketStatus: false,
    hideSymbolLogo: false,
    scalePosition: "right",
    scaleMode: "Normal",
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: "11",
    noTimeScale: false,
    valuesTracking: "1",
    changeMode: "price-and-percent",
    chartType: "area",
    lineWidth: 2,
    lineType: 0,
    dateRanges: ["1d|1", "1w|15", "1m|30", "3m|60", "12m|1D", "all|1W"]
  });

  wrapper.appendChild(script);
  container.appendChild(wrapper);
}

// 6. 주요 경제 · 실적 일정
function renderCalendarSection(events) {
  const listEl = document.getElementById("calendar-list");
  if (!listEl) return;

  if (!events.length) {
    listEl.innerHTML = `<div class="empty-inline">해당 일자에 등록된 주요 경제·실적 일정이 없습니다.</div>`;
    return;
  }

  listEl.innerHTML = events
    .map((ev) => {
      const imp = (ev.importance || "LOW").toUpperCase();
      return `
        <div class="calendar-item">
          <div class="calendar-left">
            <span class="calendar-date mono">${escapeHtml(ev.date)}</span>
            <span>${escapeHtml(ev.title)}</span>
          </div>
          <span class="imp-badge ${escapeHtml(imp)}">${escapeHtml(imp)}</span>
        </div>
      `;
    })
    .join("");
}

// =========================================================
// 월간 종합 트렌드 비교 리포트 (Supabase 일별 데이터 자동 계산)
// =========================================================
const MONTHLY_INDICATORS = [
  { key: "sp500",  label: "S&P 500",          cat: "미국 증시", invert: false, unit: "" },
  { key: "nasdaq", label: "나스닥 종합 (IXIC)", cat: "미국 증시", invert: false, unit: "" },
  { key: "dow",    label: "다우존스 (DJI)",    cat: "미국 증시", invert: false, unit: "" },
  { key: "kospi",  label: "코스피 (KOSPI)",    cat: "한국 증시", invert: false, unit: "" },
  { key: "kosdaq", label: "코스닥 (KOSDAQ)",   cat: "한국 증시", invert: false, unit: "" },
  { key: "usdkrw", label: "원/달러 환율",       cat: "외환",     invert: false, unit: "원" },
  { key: "dxy",    label: "달러 인덱스 (DXY)",  cat: "외환",     invert: false, unit: "" },
  { key: "wti",    label: "국제유가 (WTI)",     cat: "원자재",   invert: false, unit: "$" },
  { key: "vix",    label: "변동성지수 (VIX)",   cat: "변동성",   invert: true,  unit: "" },
  { key: "us10y",  label: "미 국채 10년물",     cat: "금리",     invert: false, unit: "%" }
];

function getNumericMacroVal(dateStr, indKey) {
  const list = state.allMacroByDate[dateStr] || [];
  const found = list.find((m) => normalizeMacroKey(m) === indKey);
  if (!found) return null;
  const num = Number(found.price);
  return Number.isNaN(num) || num === 0 ? null : num;
}

function renderMonthlyComparison(monthKey) {
  const [year, month] = monthKey.split("-");
  const ascDates = [...state.availableDates].sort((a, b) => a.localeCompare(b));
  const curMonthDates = ascDates.filter((d) => d.startsWith(monthKey));
  const prevDates = ascDates.filter((d) => d < `${monthKey}-01`);

  const baseDate = prevDates.length ? prevDates[prevDates.length - 1] : curMonthDates[0];
  const latestDate = curMonthDates[curMonthDates.length - 1];
  const hasPrevMonth = prevDates.length > 0;

  document.getElementById("m_headerTitle").textContent = `${year}년 ${Number(month)}월 월간 매크로 트렌드 비교 리포트`;
  document.getElementById("m_headerSubtitle").textContent = hasPrevMonth
    ? `직전월 마감 (${baseDate}) vs 해당월 누적 (${curMonthDates[0]} ~ ${latestDate} · 총 ${curMonthDates.length}거래일)`
    : `해당월 첫 기록 (${baseDate}) vs 해당월 최신 (${latestDate} · 총 ${curMonthDates.length}거래일)`;
  document.getElementById("m_periodBadge").textContent = `${curMonthDates.length}일 데이터 자동 집계`;
  document.getElementById("m_thPrevMacro").textContent = hasPrevMonth ? `직전월 마감 (${baseDate.slice(5)})` : `월초 기준 (${baseDate.slice(5)})`;
  document.getElementById("m_thCurMacro").textContent = `해당월 최신 (${latestDate.slice(5)})`;

  const tbody = document.getElementById("m_macroTableBody");
  if (tbody) {
    const rowsHtml = MONTHLY_INDICATORS.map((ind) => {
      const baseVal = getNumericMacroVal(baseDate, ind.key);
      const curVal = getNumericMacroVal(latestDate, ind.key);
      const series = curMonthDates
        .map((d) => ({ date: d, val: getNumericMacroVal(d, ind.key) }))
        .filter((p) => p.val !== null);

      if (curVal === null && series.length === 0) return "";

      let hi = series[0], lo = series[0];
      series.forEach((p) => {
        if (p.val > hi.val) hi = p;
        if (p.val < lo.val) lo = p;
      });

      const fmt = (v) => {
        if (v === null || v === undefined) return "-";
        if (ind.unit === "$") return `$${formatNum(v)}`;
        if (ind.unit === "원") return `${formatNum(v)}원`;
        if (ind.unit === "%") return `${formatNum(v)}%`;
        return formatNum(v);
      };

      let momHtml = `<span class="mono">-</span>`;
      let note = "데이터 축적 중";
      if (baseVal !== null && curVal !== null) {
        const diff = curVal - baseVal;
        const pct = (diff / baseVal) * 100;
        const cls = deltaClass(pct, ind.invert);
        const sign = diff > 0 ? "+" : "";
        momHtml = `<span class="mono mover-pct ${cls}">${sign}${pct.toFixed(2)}%</span><div style="font-size:10.5px;color:var(--text-muted);" class="mono">${sign}${formatNum(diff)}</div>`;

        if (hi && lo) {
          const rangePct = lo.val > 0 ? (((hi.val - lo.val) / lo.val) * 100).toFixed(1) : "0.0";
          note = `월중 변동폭 ${rangePct}% · 고점(${hi.date.slice(5)}) 대비 ${curVal >= hi.val * 0.995 ? "고점권" : `${(((curVal - hi.val) / hi.val) * 100).toFixed(1)}%`}`;
        }
      }

      const rangeText = hi && lo
        ? `<div class="mono" style="font-size:11px;"><span class="mover-pct up">H ${fmt(hi.val)}</span> (${hi.date.slice(5)})</div><div class="mono" style="font-size:11px;"><span class="mover-pct down">L ${fmt(lo.val)}</span> (${lo.date.slice(5)})</div>`
        : "-";

      return `
        <tr>
          <td>
            <div style="font-weight:700;">${escapeHtml(ind.label)}</div>
            <div style="font-size:10.5px;color:var(--text-muted);">${escapeHtml(ind.cat)}</div>
          </td>
          <td class="text-right mono">${escapeHtml(fmt(baseVal))}</td>
          <td class="text-center">${rangeText}</td>
          <td class="text-right mono" style="font-weight:700;">${escapeHtml(fmt(curVal))}</td>
          <td class="text-right">${momHtml}</td>
          <td style="font-size:12px;color:var(--text-secondary);">${escapeHtml(note)}</td>
        </tr>
      `;
    }).join("");

    tbody.innerHTML = rowsHtml || `<tr><td colspan="6" class="empty-inline">월간 비교에 사용할 매크로 데이터가 부족합니다.</td></tr>`;
  }

  renderMonthlyTrajectoryChart(monthKey, baseDate, curMonthDates);
}

function renderMonthlyTrajectoryChart(monthKey, baseDate, curMonthDates) {
  const indKey = state.monthlyChartIndicator;
  const indMeta = MONTHLY_INDICATORS.find((i) => i.key === indKey) || MONTHLY_INDICATORS[0];
  const metaEl = document.getElementById("m_trajMeta");
  const container = document.getElementById("m_trajectoryChartContainer");
  if (!container) return;

  document.querySelectorAll("#m-chart-indicator-tabs .seg-btn").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-ind") === indKey);
  });

  const dates = baseDate && !curMonthDates.includes(baseDate) ? [baseDate, ...curMonthDates] : [...curMonthDates];
  const points = dates
    .map((d) => ({ date: d, val: getNumericMacroVal(d, indKey) }))
    .filter((p) => p.val !== null);

  if (!points.length) {
    if (metaEl) metaEl.textContent = `${indMeta.label} 데이터 없음`;
    container.innerHTML = `<div class="empty-inline">해당 지표의 일별 데이터가 없습니다.</div>`;
    return;
  }

  const vals = points.map((p) => p.val);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const span = maxV - minV || 1;

  if (metaEl) {
    metaEl.textContent = `${indMeta.label} · 기간 최저 ${formatNum(minV)} ~ 최고 ${formatNum(maxV)} (${points.length}개 지점)`;
  }

  container.innerHTML = `
    <div class="traj-bars">
      ${points
        .map((p, idx) => {
          const ratio = (p.val - minV) / span;
          const h = Math.round(28 + ratio * 102);
          const isBase = idx === 0 && baseDate !== curMonthDates[0];
          const isLatest = idx === points.length - 1;
          const barCls = isBase ? "base" : isLatest ? "latest" : "";
          return `
            <div class="traj-col" title="${escapeHtml(p.date)}: ${formatNum(p.val)}">
              <div class="traj-val">${formatNum(p.val, p.val > 1000 ? 0 : 2)}</div>
              <div class="traj-bar ${barCls}" style="height:${h}px;"></div>
              <div class="traj-date">${escapeHtml(p.date.slice(5))}</div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

// ---------------- UI 이벤트 바인딩 ----------------
function closeMobileSidebar() {
  document.getElementById("archive-sidebar")?.classList.remove("open");
  document.getElementById("sidebar-backdrop")?.classList.remove("open");
}

function bindEvents() {
  // 상단 탭 (시장 브리핑 / 내 포트폴리오)
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const page = tab.getAttribute("data-page");
      document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("page-briefing")?.classList.toggle("hidden", page !== "briefing");
      document.getElementById("page-portfolio")?.classList.toggle("hidden", page !== "portfolio");
    });
  });

  document.getElementById("back-to-briefing-btn")?.addEventListener("click", () => {
    document.querySelector('.nav-tab[data-page="briefing"]')?.click();
  });

  document.getElementById("back-to-daily-btn")?.addEventListener("click", () => {
    showDailyView();
  });

  // 히트맵 탭 전환 (실시간 / 스냅샷)
  document.querySelectorAll("#heatmap-mode-tabs .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.heatmapMode = btn.getAttribute("data-mode") || "live";
      renderHeatmapSection(state.currentBriefing?.heatmap_data);
    });
  });

  // 월간 차트 지표 전환
  document.querySelectorAll("#m-chart-indicator-tabs .seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.monthlyChartIndicator = btn.getAttribute("data-ind") || "sp500";
      if (state.currentMonthKey) renderMonthlyComparison(state.currentMonthKey);
    });
  });

  // 다크/라이트 모드 전환
  document.getElementById("theme-toggle-btn")?.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("mb_theme", state.theme);
    applyPreferences();
    if (state.heatmapMode === "live") renderTradingViewHeatmap();
    const list = state.watchlist.length ? state.watchlist : DEFAULT_WATCHLIST;
    const sel = list.find((w) => w.yf_ticker === state.selectedWatchlistTicker) || list[0];
    renderWatchlistChartWidget(sel);
  });

  // US / KR 색상 기준 전환
  document.getElementById("color-scheme-btn")?.addEventListener("click", () => {
    state.marketColor = state.marketColor === "kr" ? "us" : "kr";
    localStorage.setItem("mb_market_color", state.marketColor);
    applyPreferences();
  });

  // 새로고침
  document.getElementById("refresh-btn")?.addEventListener("click", () => {
    bootstrapData();
  });

  // 아카이브 검색
  document.getElementById("archive-search-input")?.addEventListener("input", (e) => {
    renderArchiveSidebar(state.availableDates, e.target.value);
  });

  // 모바일 드로어
  document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
    document.getElementById("archive-sidebar")?.classList.toggle("open");
    document.getElementById("sidebar-backdrop")?.classList.toggle("open");
  });

  document.getElementById("sidebar-backdrop")?.addEventListener("click", closeMobileSidebar);
}

document.addEventListener("DOMContentLoaded", () => {
  applyPreferences();
  bindEvents();
  bootstrapData();
});
