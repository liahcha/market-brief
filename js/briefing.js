/* =========================================================
   Market Brief — Supabase 연동 및 6대 공개 섹션 렌더링
   ========================================================= */

const DEFAULT_WATCHLIST = [
  { tv_symbol: "NASDAQ:NVDA", yf_ticker: "NVDA", name: "엔비디아" },
  { tv_symbol: "NASDAQ:AAPL", yf_ticker: "AAPL", name: "애플" },
  { tv_symbol: "NASDAQ:MSFT", yf_ticker: "MSFT", name: "마이크로소프트" },
  { tv_symbol: "KRX:005930", yf_ticker: "005930.KS", name: "삼성전자" }
];

// DB가 아직 비어 있을 때 UI 확인용 샘플 데이터
const SAMPLE_BRIEFING = {
  briefing_date: "2026-11-24",
  macro_data: [
    { name: "S&P 500", symbol: "^GSPC", price: 6012.45, change_pct: 0.68 },
    { name: "NASDAQ", symbol: "^IXIC", price: 19245.10, change_pct: 1.12 },
    { name: "DOW", symbol: "^DJI", price: 44120.30, change_pct: 0.34 },
    { name: "KOSPI", symbol: "^KS11", price: 2534.80, change_pct: 0.51 },
    { name: "KOSDAQ", symbol: "^KQ11", price: 704.15, change_pct: -0.22 },
    { name: "USD/KRW", symbol: "KRW=X", price: 1394.50, change_pct: -0.35 },
    { name: "DXY", symbol: "DX-Y.NYB", price: 106.42, change_pct: -0.18 },
    { name: "VIX", symbol: "^VIX", price: 14.85, change_pct: -4.20 },
    { name: "WTI", symbol: "CL=F", price: 69.40, change_pct: -1.05 },
    { name: "US10Y", symbol: "^TNX", price: 4.32, change_pct: -0.92 }
  ],
  heatmap_data: [],
  ai_summary: {
    headline: "[샘플 미리보기] 미 국채금리 진정과 AI 반도체 강세에 뉴욕증시 상승 마감",
    three_line_summary: [
      "미 국채 10년물 금리가 하락 안정세를 보이며 기술주와 성장주 중심으로 매수세가 유입되었습니다.",
      "AI 인프라 투자 확대 기대감이 이어지며 반도체 및 클라우드 대형주가 나스닥 상승을 주도했습니다.",
      "국제유가 하락과 달러 인덱스 약세가 맞물리며 원/달러 환율도 소폭 하향 안정 흐름을 나타냈습니다."
    ],
    sector_flow: "반도체·소프트웨어·커뮤니케이션 섹터가 뚜렷한 강세를 보인 반면, 국제유가 약세 영향으로 에너지 섹터와 일부 경기방어주는 차익 실현 매물이 출회되며 혼조세를 기록했습니다.",
    curated_links: [
      { title: "Finviz S&P 500 실시간 히트맵 바로가기", source: "Finviz", url: "https://finviz.com/map.ashx" },
      { title: "Yahoo Finance 글로벌 시장 주요 뉴스", source: "Yahoo Finance", url: "https://finance.yahoo.com/" },
      { title: "한경 글로벌마켓 유튜브 채널", source: "YouTube", url: "https://www.youtube.com/@hkglobalmarket" }
    ]
  },
  key_movers: [
    { ticker: "NVDA", name: "엔비디아", change_pct: 2.85, reason: "차세대 AI 가속기 수요 견조 및 주요 빅테크 설비투자 가이던스 상향 기대감" },
    { ticker: "MSFT", name: "마이크로소프트", change_pct: 1.42, reason: "클라우드 AI 워크로드 성장세 지속 전망에 기관 매수세 유입" },
    { ticker: "AAPL", name: "애플", change_pct: 0.74, reason: "연말 쇼핑 시즌 하드웨어 교체 수요 기대 및 국채금리 하락 수혜" },
    { ticker: "TSLA", name: "테슬라", change_pct: -1.35, reason: "단기 급등에 따른 차익 실현 매물 출회" },
    { ticker: "XOM", name: "엑슨모빌", change_pct: -1.18, reason: "WTI 국제유가 하락에 따른 에너지 섹터 전반 약세 동조" }
  ],
  watchlist_comments: [
    { ticker: "NVDA", name: "엔비디아", comment: "AI 데이터센터 투자 모멘텀이 유지되며 반도체 섹터 내 강세 흐름을 주도했습니다." },
    { ticker: "AAPL", name: "애플", comment: "국채금리 안정과 함께 완만한 상승세를 보이며 직전 고점 부근 매물을 소화 중입니다." },
    { ticker: "MSFT", name: "마이크로소프트", comment: "클라우드 및 엔터프라이즈 AI 수익화 기대감이 하단을 견고하게 지지했습니다." },
    { ticker: "005930.KS", name: "삼성전자", comment: "외국인 수급 변화와 글로벌 메모리 업황 심리에 연동해 박스권 등락을 이어갔습니다." }
  ],
  calendar_events: [
    { date: "2026-11-25", title: "미국 소비자신뢰지수 및 FOMC 의사록 공개", importance: "HIGH" },
    { date: "2026-11-26", title: "미국 근원 개인소비지출(PCE) 물가지수 발표", importance: "HIGH" },
    { date: "2026-11-27", title: "한국은행 금융통화위원회 기준금리 결정", importance: "HIGH" },
    { date: "2026-11-28", title: "미국 추수감사절 휴장 / 블랙프라이데이 조기 폐장", importance: "MEDIUM" }
  ]
};

// 앱 상태
const state = {
  supabase: null,
  availableDates: [],
  currentDate: null,
  currentBriefing: null,
  watchlist: [...DEFAULT_WATCHLIST],
  selectedWatchlistIndex: 0,
  moversFilter: "all",
  isSampleMode: false,
  theme: localStorage.getItem("mb_theme") || "light",
  marketColor: localStorage.getItem("mb_market_color") || "kr"
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
  const trimmed = url.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return trimmed;
  return "#";
}

function formatPrice(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return "-";
  return Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatPctBadge(pct) {
  const num = Number(pct);
  if (Number.isNaN(num)) return `<span class="pct-badge flat">-</span>`;
  if (num > 0) return `<span class="pct-badge up">▲ +${num.toFixed(2)}%</span>`;
  if (num < 0) return `<span class="pct-badge down">▼ ${num.toFixed(2)}%</span>`;
  return `<span class="pct-badge flat">0.00%</span>`;
}

// ---------------- 테마 & 색상 기준 ----------------
function applyPreferences() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.documentElement.setAttribute("data-market-color", state.marketColor);

  const themeIcon = document.getElementById("theme-icon");
  if (themeIcon) themeIcon.textContent = state.theme === "dark" ? "☀️" : "🌙";

  const colorBtn = document.getElementById("color-scheme-btn");
  if (colorBtn) colorBtn.textContent = state.marketColor === "kr" ? "KR 색상" : "US 색상";
}

function setStatusBadge(type, text) {
  const el = document.getElementById("db-status-badge");
  if (!el) return;
  el.className = `status-badge ${type}`;
  el.textContent = text;
}

function showNotice(htmlText, showToggle = false) {
  const banner = document.getElementById("notice-banner");
  const textEl = document.getElementById("notice-text");
  const btn = document.getElementById("notice-action-btn");
  if (!banner || !textEl) return;

  textEl.innerHTML = htmlText;
  banner.classList.remove("hidden");
  if (showToggle && btn) {
    btn.classList.remove("hidden");
  } else if (btn) {
    btn.classList.add("hidden");
  }
}

function hideNotice() {
  const banner = document.getElementById("notice-banner");
  if (banner) banner.classList.add("hidden");
}

// ---------------- Supabase 초기화 ----------------
function initSupabase() {
  const cfg = window.APP_CONFIG || {};
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_PUBLISHABLE_KEY) {
    console.warn("Supabase 설정이 누락되었습니다.");
    return null;
  }
  return window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY);
}

// ---------------- 데이터 로드 ----------------
async function bootstrapData() {
  setStatusBadge("loading", "DB 조회 중...");
  state.supabase = initSupabase();

  if (!state.supabase) {
    activateSampleMode("Supabase 설정(js/config.js)을 확인할 수 없어 <strong>샘플 미리보기</strong>를 표시합니다.");
    return;
  }

  try {
    // 1. 관심종목 조회
    const wlRes = await state.supabase
      .from("watchlist")
      .select("tv_symbol, yf_ticker, name, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!wlRes.error && Array.isArray(wlRes.data) && wlRes.data.length > 0) {
      state.watchlist = wlRes.data;
    }

    // 2. 브리핑 날짜 목록 조회
    const dateRes = await state.supabase
      .from("daily_briefings")
      .select("briefing_date")
      .order("briefing_date", { ascending: false });

    if (dateRes.error) {
      throw dateRes.error;
    }

    state.availableDates = (dateRes.data || []).map((r) => r.briefing_date);

    if (state.availableDates.length === 0) {
      activateSampleMode(
        "수파베이스 연결은 정상입니다. 다만 <code>daily_briefings</code> 테이블에 아직 적재된 데이터가 없어 <strong>UI 확인용 샘플 미리보기</strong>를 표시하고 있습니다. 백엔드 워크플로우가 1회 성공하면 실제 데이터가 자동으로 나타납니다."
      );
      return;
    }

    // 실제 DB 데이터 로드
    state.isSampleMode = false;
    setStatusBadge("live", "LIVE DB");
    hideNotice();
    renderArchiveSidebar(state.availableDates);
    await loadBriefingByDate(state.availableDates[0]);
  } catch (err) {
    console.error("Supabase 로드 오류:", err);
    activateSampleMode(
      `수파베이스 조회 중 오류가 발생해 <strong>샘플 미리보기</strong>로 전환했습니다. (오류: ${escapeHtml(err.message || String(err))})`
    );
  }
}

function activateSampleMode(messageHtml) {
  state.isSampleMode = true;
  state.availableDates = [SAMPLE_BRIEFING.briefing_date];
  state.currentDate = SAMPLE_BRIEFING.briefing_date;
  state.currentBriefing = SAMPLE_BRIEFING;

  setStatusBadge("sample", "샘플 미리보기");
  showNotice(messageHtml, false);
  renderArchiveSidebar(state.availableDates);
  renderFullBriefing(SAMPLE_BRIEFING);
}

async function loadBriefingByDate(dateStr) {
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
    highlightActiveDate(dateStr);
    renderFullBriefing(data);
    closeMobileSidebar();
  } catch (err) {
    console.error("브리핑 상세 로드 실패:", err);
    showNotice(`해당 날짜(${escapeHtml(dateStr)}) 데이터를 불러오지 못했습니다: ${escapeHtml(err.message || err)}`);
  }
}

// ---------------- 좌측 아카이브 사이드바 ----------------
function renderArchiveSidebar(dates, filterText = "") {
  const tree = document.getElementById("archive-tree");
  const countEl = document.getElementById("archive-count");
  if (!tree) return;

  const filtered = filterText
    ? dates.filter((d) => d.includes(filterText.trim()))
    : dates;

  if (countEl) countEl.textContent = `${filtered.length}건`;

  if (filtered.length === 0) {
    tree.innerHTML = `<div class="empty-inline">일치하는 브리핑이 없습니다.</div>`;
    return;
  }

  // 연-월 그룹핑
  const groups = {};
  filtered.forEach((d) => {
    const ym = d.slice(0, 7);
    if (!groups[ym]) groups[ym] = [];
    groups[ym].push(d);
  });

  const months = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  tree.innerHTML = months
    .map((ym, idx) => {
      const [year, month] = ym.split("-");
      const collapsedClass = idx > 1 ? "collapsed" : "";
      const itemsHtml = groups[ym]
        .map((d) => {
          const activeClass = d === state.currentDate ? "active" : "";
          return `<button class="date-item-btn ${activeClass}" data-date="${escapeHtml(d)}">
            <span>${escapeHtml(d)}</span>
          </button>`;
        })
        .join("");

      return `
        <div class="month-group ${collapsedClass}">
          <button class="month-toggle" type="button">
            <span>${escapeHtml(year)}년 ${escapeHtml(month)}월 (${groups[ym].length})</span>
            <span class="chevron">▼</span>
          </button>
          <div class="month-dates">${itemsHtml}</div>
        </div>
      `;
    })
    .join("");

  // 아코디언 토글 이벤트
  tree.querySelectorAll(".month-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("collapsed");
    });
  });

  // 날짜 클릭 이벤트
  tree.querySelectorAll(".date-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetDate = btn.getAttribute("data-date");
      if (targetDate && targetDate !== state.currentDate) {
        loadBriefingByDate(targetDate);
      }
    });
  });
}

function highlightActiveDate(dateStr) {
  document.querySelectorAll(".date-item-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-date") === dateStr);
  });
}

// ---------------- 6대 공개 섹션 렌더링 ----------------
function renderFullBriefing(data) {
  if (!data) return;

  // 헤더
  const datePill = document.getElementById("current-date-pill");
  const heroDate = document.getElementById("hero-date-label");
  const heroHeadline = document.getElementById("hero-headline");

  if (datePill) datePill.textContent = data.briefing_date || "-";
  if (heroDate) heroDate.textContent = `기준일: ${data.briefing_date || "-"} (오전 브리핑)`;
  if (heroHeadline) {
    heroHeadline.textContent = data.ai_summary?.headline || `${data.briefing_date} 데일리 시장 브리핑`;
  }

  renderMacroSection(data.macro_data || []);
  renderHeatmapWidget();
  renderAISummarySection(data.ai_summary || {});
  renderKeyMoversSection(data.key_movers || []);
  renderWatchlistSection(data.watchlist_comments || []);
  renderCalendarSection(data.calendar_events || []);
}

// 1. 매크로 & 지수
function renderMacroSection(macroList) {
  const grid = document.getElementById("macro-grid");
  if (!grid) return;

  if (!macroList.length) {
    grid.innerHTML = `<div class="empty-inline">매크로 지표 데이터가 없습니다.</div>`;
    return;
  }

  grid.innerHTML = macroList
    .map(
      (item) => `
      <div class="macro-card">
        <div class="macro-top">
          <span class="macro-name">${escapeHtml(item.name)}</span>
          <span class="macro-symbol">${escapeHtml(item.symbol)}</span>
        </div>
        <div class="macro-price">${formatPrice(item.price)}</div>
        <div>${formatPctBadge(item.change_pct)}</div>
      </div>
    `
    )
    .join("");
}

// 2. S&P 500 히트맵 (TradingView 공식 위젯)
function renderHeatmapWidget() {
  const container = document.getElementById("heatmap-widget-container");
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

// 3. AI 시황 요약
function renderAISummarySection(summary) {
  const bulletsEl = document.getElementById("summary-bullets");
  const sectorEl = document.getElementById("sector-flow-box");
  const linksEl = document.getElementById("curated-links-list");

  const lines = Array.isArray(summary.three_line_summary) ? summary.three_line_summary : [];
  if (bulletsEl) {
    bulletsEl.innerHTML = lines.length
      ? lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")
      : `<li>요약 데이터가 없습니다.</li>`;
  }

  if (sectorEl) {
    sectorEl.textContent = summary.sector_flow || "섹터 흐름 요약이 없습니다.";
  }

  const links = Array.isArray(summary.curated_links) ? summary.curated_links : [];
  if (linksEl) {
    linksEl.innerHTML = links.length
      ? links
          .map(
            (link) => `
          <a class="link-card" href="${escapeHtml(safeUrl(link.url))}" target="_blank" rel="noopener noreferrer">
            <div class="link-source">${escapeHtml(link.source || "NEWS")}</div>
            <div class="link-title">${escapeHtml(link.title || link.url)} ↗</div>
          </a>
        `
          )
          .join("")
      : `<div class="empty-inline">큐레이션된 링크가 없습니다.</div>`;
  }
}

// 4. 주요 특징주
function renderKeyMoversSection(movers) {
  const tbody = document.getElementById("movers-tbody");
  if (!tbody) return;

  const filtered = movers.filter((m) => {
    const pct = Number(m.change_pct || 0);
    if (state.moversFilter === "up") return pct > 0;
    if (state.moversFilter === "down") return pct < 0;
    return true;
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-inline">표시할 특징주가 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (m) => `
      <tr>
        <td><span class="ticker-pill">${escapeHtml(m.ticker)}</span></td>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td style="text-align: right;">${formatPctBadge(m.change_pct)}</td>
        <td>${escapeHtml(m.reason)}</td>
      </tr>
    `
    )
    .join("");
}

// 5. 관심종목 실시간 추이 (TradingView Symbol Overview + AI 코멘트)
function renderWatchlistSection(comments) {
  const tabsEl = document.getElementById("watchlist-tabs");
  const gridEl = document.getElementById("watchlist-comments-grid");
  if (!tabsEl) return;

  const list = state.watchlist.length ? state.watchlist : DEFAULT_WATCHLIST;
  if (state.selectedWatchlistIndex >= list.length) {
    state.selectedWatchlistIndex = 0;
  }

  tabsEl.innerHTML = list
    .map(
      (item, idx) => `
      <button class="watchlist-chip ${idx === state.selectedWatchlistIndex ? "active" : ""}" data-idx="${idx}">
        <span>${escapeHtml(item.name)}</span>
        <span class="chip-ticker">${escapeHtml(item.yf_ticker)}</span>
      </button>
    `
    )
    .join("");

  tabsEl.querySelectorAll(".watchlist-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedWatchlistIndex = Number(btn.getAttribute("data-idx"));
      renderWatchlistSection(comments);
    });
  });

  const selected = list[state.selectedWatchlistIndex];
  renderWatchlistChartWidget(selected);
  renderSelectedWatchlistComment(selected, comments);

  // 전체 관심종목 코멘트 요약 카드
  if (gridEl) {
    gridEl.innerHTML = list
      .map((item, idx) => {
        const matched = findCommentForWatchlist(item, comments);
        return `
          <div class="wl-comment-card" data-idx="${idx}">
            <div class="wl-comment-head">
              <span class="ticker-pill">${escapeHtml(item.yf_ticker)}</span>
              <span class="wl-comment-name">${escapeHtml(item.name)}</span>
            </div>
            <div class="wl-comment-body">${escapeHtml(matched ? matched.comment : "오늘의 AI 코멘트가 아직 등록되지 않았습니다.")}</div>
          </div>
        `;
      })
      .join("");

    gridEl.querySelectorAll(".wl-comment-card").forEach((card) => {
      card.addEventListener("click", () => {
        state.selectedWatchlistIndex = Number(card.getAttribute("data-idx"));
        renderWatchlistSection(comments);
      });
    });
  }
}

function findCommentForWatchlist(item, comments) {
  if (!Array.isArray(comments)) return null;
  const targetTicker = (item.yf_ticker || "").toUpperCase();
  const baseTicker = targetTicker.split(".")[0];
  return comments.find((c) => {
    const ct = (c.ticker || "").toUpperCase();
    return ct === targetTicker || ct.split(".")[0] === baseTicker || c.name === item.name;
  });
}

function renderSelectedWatchlistComment(selected, comments) {
  const box = document.getElementById("selected-watchlist-comment");
  if (!box || !selected) return;
  const matched = findCommentForWatchlist(selected, comments);
  box.innerHTML = `
    <strong>${escapeHtml(selected.name)} (${escapeHtml(selected.yf_ticker)}) AI 데일리 코멘트:</strong>
    ${escapeHtml(matched ? matched.comment : "해당 종목에 대한 당일 AI 코멘트가 없습니다.")}
  `;
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

// 6. 주요 경제·실적 일정
function renderCalendarSection(events) {
  const listEl = document.getElementById("calendar-list");
  if (!listEl) return;

  if (!events.length) {
    listEl.innerHTML = `<div class="empty-inline">예정된 주요 일정이 없습니다.</div>`;
    return;
  }

  listEl.innerHTML = events
    .map((ev) => {
      const imp = (ev.importance || "LOW").toUpperCase();
      return `
        <div class="calendar-item">
          <div class="calendar-left">
            <span class="calendar-date">${escapeHtml(ev.date)}</span>
            <span class="calendar-title">${escapeHtml(ev.title)}</span>
          </div>
          <span class="imp-badge ${escapeHtml(imp)}">${escapeHtml(imp)}</span>
        </div>
      `;
    })
    .join("");
}

// ---------------- UI 인터랙션 바인딩 ----------------
function closeMobileSidebar() {
  document.getElementById("archive-sidebar")?.classList.remove("open");
  document.getElementById("sidebar-backdrop")?.classList.remove("open");
}

function bindEvents() {
  // 페이지 전환 (시장 브리핑 / 포트폴리오)
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

  // 다크/라이트 테마 전환
  document.getElementById("theme-toggle-btn")?.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("mb_theme", state.theme);
    applyPreferences();
    // TradingView 위젯 테마 동기화
    renderHeatmapWidget();
    const list = state.watchlist.length ? state.watchlist : DEFAULT_WATCHLIST;
    renderWatchlistChartWidget(list[state.selectedWatchlistIndex]);
  });

  // KR / US 등락 색상 전환
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

  // 특징주 필터
  document.querySelectorAll("#movers-filter .filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#movers-filter .filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.moversFilter = btn.getAttribute("data-filter") || "all";
      renderKeyMoversSection(state.currentBriefing?.key_movers || []);
    });
  });

  // 모바일 사이드바
  document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
    document.getElementById("archive-sidebar")?.classList.toggle("open");
    document.getElementById("sidebar-backdrop")?.classList.toggle("open");
  });

  document.getElementById("sidebar-backdrop")?.addEventListener("click", closeMobileSidebar);
}

// 실행 시작
document.addEventListener("DOMContentLoaded", () => {
  applyPreferences();
  bindEvents();
  bootstrapData();
});
