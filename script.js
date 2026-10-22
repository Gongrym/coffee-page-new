/* =========================================
   ONDO — 인터랙션 확장 스크립트
   HTML: 기존 index.html 구조에 맞춤
   CSS: 추가 스타일은 JavaScript에서 자동 생성
========================================= */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const menuButton = $(".menu-toggle");
const nav = $(".nav");
const toast = $(".toast");

let toastTimer;

/* =========================================
   1. 공통 알림 메시지
========================================= */

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

/* =========================================
   2. 모바일 메뉴
========================================= */

function closeMenu() {
  if (!menuButton || !nav) return;

  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "메뉴 열기");
  nav.classList.remove("open");
}

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") !== "true";

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");

    nav.classList.toggle("open", isOpen);
  });

  // 메뉴 링크를 누르면 메뉴 닫기
  $$("a", nav).forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // 메뉴 바깥을 누르면 닫기
  document.addEventListener("click", (event) => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    if (
      isOpen &&
      !nav.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  });
}

/* =========================================
   3. HTML에서 상품 정보 가져오기
========================================= */

const productCards = $$(".product");

const products = productCards.map((card, index) => {
  const priceText = $(".price strong", card)?.textContent || "";
  const image = $(".product-art img", card);

  // 현재 HTML의 상품 순서에 맞춘 취향 분류
  const profiles = [
    {
      key: "balanced",
      tags: ["고소함", "초콜릿", "균형"],
    },
    {
      key: "bright",
      tags: ["산미", "과일", "꽃 향"],
    },
    {
      key: "decaf",
      tags: ["디카페인", "부드러움", "저녁"],
    },
  ];

  const profile = profiles[index] || {
    key: "other",
    tags: [],
  };

  return {
    card,
    title: $("h3", card)?.textContent.trim() || `커피 ${index + 1}`,
    english: $(".english", card)?.textContent.trim() || "",
    notes: $(".notes", card)?.textContent.trim() || "",
    tag: $(".tag", card)?.textContent.trim() || "",
    size: $(".price span", card)?.textContent.trim() || "200g",
    price: Number(priceText.replace(/[^\d]/g, "")) || 0,
    image: image?.getAttribute("src") || "",
    imageAlt: image?.getAttribute("alt") || "",
    key: profile.key,
    tags: profile.tags,
  };
});

function formatPrice(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}

/* =========================================
   4. 추가 기능에 필요한 CSS 자동 삽입
========================================= */

const style = document.createElement("style");

style.textContent = `
.ondo-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  margin: 26px 0 30px;
}

.ondo-tools-label {
  width: 100%;
  margin: 0 0 2px;
  color: var(--soft, #6f5f54);
  font-size: 13px;
}

.ondo-filter {
  padding: 10px 15px;
  border: 1px solid var(--line, #dccfbc);
  border-radius: 999px;
  background: transparent;
  color: var(--ink, #2b1d16);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background .2s, color .2s;
}

.ondo-filter[aria-pressed="true"] {
  background: var(--dark, #3a2a22);
  border-color: var(--dark, #3a2a22);
  color: #fffaf3;
}

.product[hidden] {
  display: none !important;
}

.ondo-details {
  margin-top: 12px;
  padding: 0 0 4px;
  border: 0;
  border-bottom: 1px solid currentColor;
  background: transparent;
  color: var(--ink, #2b1d16);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.product-art img {
  transition: transform .4s ease;
}

.product-art:hover img {
  transform: scale(1.035);
}

/* 상품 상세 팝업 */

.ondo-layer {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 20px;
  background: #21181299;
  opacity: 0;
  visibility: hidden;
  transition: opacity .2s, visibility .2s;
}

.ondo-layer.open {
  opacity: 1;
  visibility: visible;
}

.ondo-dialog {
  position: relative;
  width: min(740px, 100%);
  max-height: 88vh;
  overflow: auto;
  background: var(--bg, #f6f0e6);
  color: var(--ink, #2b1d16);
  transform: translateY(10px);
  transition: transform .2s;
}

.ondo-layer.open .ondo-dialog {
  transform: translateY(0);
}

.ondo-x {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 2;
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 50%;
  background: var(--bg, #f6f0e6);
  color: inherit;
  font-size: 26px;
  cursor: pointer;
}

.ondo-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.ondo-detail-image {
  display: grid;
  min-height: 300px;
  place-items: center;
  background: var(--paper, #efe6d8);
  overflow: hidden;
}

.ondo-detail-image img {
  width: 100%;
  height: 100%;
  max-height: 480px;
  object-fit: cover;
}

.ondo-detail-copy {
  padding: clamp(24px, 4vw, 42px);
  align-self: center;
}

.ondo-detail-copy h2 {
  margin: 8px 0;
  font-size: clamp(24px, 3vw, 36px);
}

.ondo-detail-copy p {
  line-height: 1.8;
}

.ondo-muted {
  color: var(--soft, #6f5f54);
  font-size: 13px;
}

.ondo-primary {
  padding: 13px 18px;
  border: 0;
  border-radius: 999px;
  background: var(--dark, #3a2a22);
  color: white;
  font: inherit;
  cursor: pointer;
}

/* 커피 취향 테스트 */

.ondo-quiz-dialog {
  width: min(560px, 100%);
  padding: clamp(24px, 5vw, 42px);
}

.ondo-quiz-dialog h2 {
  margin: 8px 0 22px;
  font-size: clamp(24px, 4vw, 34px);
}

.ondo-quiz-dialog fieldset {
  margin: 0 0 22px;
  padding: 0;
  border: 0;
}

.ondo-quiz-dialog legend {
  margin-bottom: 10px;
  font-weight: 700;
}

.ondo-option {
  display: block;
  margin: 8px 0;
  padding: 12px;
  border: 1px solid var(--line, #dccfbc);
  cursor: pointer;
}

.ondo-option:has(input:checked) {
  background: var(--paper, #efe6d8);
  border-color: var(--dark, #3a2a22);
}

.ondo-option input {
  margin-right: 8px;
  accent-color: var(--dark, #3a2a22);
}

.ondo-result {
  margin-top: 18px;
  padding: 18px;
  background: var(--paper, #efe6d8);
  line-height: 1.8;
}

.ondo-quiz-launch {
  margin-left: auto;
  padding: 11px 16px;
  border: 0;
  border-radius: 999px;
  background: var(--accent, #b4533a);
  color: white;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

/* 장바구니 버튼 */

.ondo-cart-trigger {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 900;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border: 0;
  border-radius: 999px;
  background: var(--dark, #3a2a22);
  color: #fffaf3;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 28px #2b1d1626;
}

.ondo-cart-count {
  display: inline-grid;
  place-items: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 50px;
  background: var(--bg, #f6f0e6);
  color: var(--dark, #3a2a22);
  font-size: 12px;
}

/* 장바구니 패널 */

.ondo-cart-layer {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: #21181280;
  opacity: 0;
  visibility: hidden;
  transition: opacity .2s, visibility .2s;
}

.ondo-cart-layer.open {
  opacity: 1;
  visibility: visible;
}

.ondo-cart-panel {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: min(430px, 100%);
  height: 100%;
  padding: 26px;
  background: var(--bg, #f6f0e6);
  color: var(--ink, #2b1d16);
  transform: translateX(100%);
  transition: transform .25s;
  box-sizing: border-box;
}

.ondo-cart-layer.open .ondo-cart-panel {
  transform: translateX(0);
}

.ondo-cart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line, #dccfbc);
}

.ondo-cart-head h2 {
  margin: 0;
  font-size: 24px;
}

.ondo-cart-items {
  flex: 1;
  overflow: auto;
  padding: 12px 0;
}

.ondo-cart-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 17px 0;
  border-bottom: 1px solid var(--line, #dccfbc);
}

.ondo-cart-row-name {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.ondo-cart-row-price {
  margin-top: 8px;
  color: var(--soft, #6f5f54);
  font-size: 14px;
}

.ondo-qty {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.ondo-qty button,
.ondo-remove {
  padding: 5px 10px;
  border: 1px solid var(--line, #dccfbc);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.ondo-cart-bottom {
  padding-top: 18px;
  border-top: 1px solid var(--line, #dccfbc);
}

.ondo-total {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  font-weight: 700;
}

.ondo-checkout {
  width: 100%;
  padding: 14px;
  border: 0;
  border-radius: 999px;
  background: var(--dark, #3a2a22);
  color: white;
  font: inherit;
  cursor: pointer;
}

.ondo-checkout:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.ondo-empty {
  padding: 35px 0;
  color: var(--soft, #6f5f54);
  line-height: 1.8;
}

/* 스크롤 등장 효과 */

.ondo-reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity .6s, transform .6s;
}

.ondo-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 맨 위로 버튼 */

.ondo-back-top {
  position: fixed;
  right: 28px;
  bottom: 92px;
  z-index: 800;
  width: 44px;
  height: 44px;
  border: 1px solid var(--line, #dccfbc);
  border-radius: 50%;
  background: var(--bg, #f6f0e6);
  color: var(--ink, #2b1d16);
  font-size: 20px;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: opacity .2s, visibility .2s;
}

.ondo-back-top.visible {
  opacity: 1;
  visibility: visible;
}

/* 모바일 대응 */

@media (max-width: 620px) {
  .ondo-detail-grid {
    grid-template-columns: 1fr;
  }

  .ondo-detail-image {
    min-height: 210px;
    max-height: 280px;
  }

  .ondo-cart-trigger {
    right: 16px;
    bottom: 16px;
  }

  .ondo-back-top {
    right: 20px;
    bottom: 82px;
  }

  .ondo-cart-panel {
    padding: 21px;
  }
}

/* 사용자의 모션 감소 설정 존중 */

@media (prefers-reduced-motion: reduce) {
  .ondo-layer,
  .ondo-dialog,
  .ondo-cart-layer,
  .ondo-cart-panel,
  .ondo-reveal,
  .ondo-back-top,
  .product-art img {
    transition: none !important;
  }

  .ondo-reveal {
    opacity: 1;
    transform: none;
  }
}
`;

document.head.appendChild(style);

/* =========================================
   5. 상품 필터 + 취향 테스트 버튼 생성
========================================= */

const coffeeSection = $("#coffee");
const productsContainer = $(".products");

if (coffeeSection && productsContainer && products.length) {
  const tools = document.createElement("div");
  tools.className = "ondo-tools";

  const label = document.createElement("p");
  label.className = "ondo-tools-label";
  label.textContent = "어떤 커피를 찾으세요?";

  tools.appendChild(label);

  const filterOptions = [
    ["all", "전체 보기"],
    ["balanced", "고소하고 균형 잡힌"],
    ["bright", "산뜻하고 향긋한"],
    ["decaf", "디카페인"],
  ];

  filterOptions.forEach(([key, text], index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "ondo-filter";
    button.textContent = text;
    button.setAttribute("aria-pressed", String(index === 0));

    button.addEventListener("click", () => {
      $$(".ondo-filter", tools).forEach((filterButton) => {
        filterButton.setAttribute(
          "aria-pressed",
          String(filterButton === button),
        );
      });

      products.forEach((product) => {
        product.card.hidden = key !== "all" && product.key !== key;
      });
    });

    tools.appendChild(button);
  });

  const quizLaunch = document.createElement("button");

  quizLaunch.type = "button";
  quizLaunch.className = "ondo-quiz-launch";
  quizLaunch.textContent = "내 취향 찾기 ↗";

  tools.appendChild(quizLaunch);

  coffeeSection.insertBefore(tools, productsContainer);
}

/* =========================================
   6. 상품 상세 팝업
========================================= */

const detailLayer = document.createElement("div");

detailLayer.className = "ondo-layer";

detailLayer.innerHTML = `
  <section
    class="ondo-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="ondo-detail-title"
  >
    <button
      class="ondo-x"
      type="button"
      aria-label="닫기"
    >×</button>

    <div class="ondo-detail-grid">
      <div class="ondo-detail-image"></div>

      <div class="ondo-detail-copy">
        <p class="eyebrow ondo-detail-tag"></p>
        <h2 id="ondo-detail-title"></h2>
        <p class="english ondo-detail-english"></p>
        <p class="ondo-detail-notes"></p>
        <p class="ondo-muted ondo-detail-size"></p>
        <p class="ondo-detail-price"></p>

        <button
          class="ondo-primary ondo-detail-add"
          type="button"
        >장바구니에 담기 +</button>
      </div>
    </div>
  </section>
`;

document.body.appendChild(detailLayer);

let selectedProduct = null;

function openDetails(product) {
  selectedProduct = product;

  const imageBox = $(".ondo-detail-image", detailLayer);
  imageBox.replaceChildren();

  if (product.image) {
    const image = document.createElement("img");

    image.src = product.image;
    image.alt = product.imageAlt;

    image.onerror = () => {
      imageBox.replaceChildren();
    };

    imageBox.appendChild(image);
  }

  $(".ondo-detail-tag", detailLayer).textContent = product.tag;
  $("#ondo-detail-title", detailLayer).textContent = product.title;
  $(".ondo-detail-english", detailLayer).textContent = product.english;
  $(".ondo-detail-notes", detailLayer).textContent = product.notes;
  $(".ondo-detail-size", detailLayer).textContent =
    `${product.size} · 주문 후 신선하게 준비합니다.`;
  $(".ondo-detail-price", detailLayer).textContent = formatPrice(product.price);

  detailLayer.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeDetails() {
  detailLayer.classList.remove("open");
  unlockPageIfNoLayer();
}

$(".ondo-x", detailLayer).addEventListener("click", closeDetails);

detailLayer.addEventListener("click", (event) => {
  if (event.target === detailLayer) {
    closeDetails();
  }
});

// 각 상품에 상세 보기 버튼 추가
products.forEach((product) => {
  const info = $(".product-info", product.card);

  if (info) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "ondo-details";
    button.textContent = "원두 자세히 보기 ↗";

    button.addEventListener("click", () => {
      openDetails(product);
    });

    info.appendChild(button);
  }

  // 상품 이미지 영역을 눌러도 상세 보기
  const art = $(".product-art", product.card);

  if (art) {
    art.style.cursor = "pointer";

    art.addEventListener("click", (event) => {
      if (!event.target.closest(".add")) {
        openDetails(product);
      }
    });
  }
});

/* =========================================
   7. 커피 취향 테스트
========================================= */

const quizLayer = document.createElement("div");

quizLayer.className = "ondo-layer";

quizLayer.innerHTML = `
  <section
    class="ondo-dialog ondo-quiz-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="ondo-quiz-title"
  >
    <button
      class="ondo-x ondo-quiz-x"
      type="button"
      aria-label="닫기"
    >×</button>

    <p class="eyebrow">YOUR COFFEE TONE</p>
    <h2 id="ondo-quiz-title">오늘의 취향을 찾아볼까요?</h2>

    <form class="ondo-quiz-form">
      <fieldset>
        <legend>1. 어떤 맛이 끌리나요?</legend>

        <label class="ondo-option">
          <input type="radio" name="taste" value="balanced" required>
          고소하고 달콤한 맛
        </label>

        <label class="ondo-option">
          <input type="radio" name="taste" value="bright">
          과일처럼 산뜻한 맛
        </label>

        <label class="ondo-option">
          <input type="radio" name="taste" value="decaf">
          부드럽고 편안한 맛
        </label>
      </fieldset>

      <fieldset>
        <legend>2. 언제 마실 커피인가요?</legend>

        <label class="ondo-option">
          <input type="radio" name="time" value="any" required>
          하루 중 언제든
        </label>

        <label class="ondo-option">
          <input type="radio" name="time" value="morning">
          아침을 깨우는 한 잔
        </label>

        <label class="ondo-option">
          <input type="radio" name="time" value="evening">
          저녁에도 부담 없이
        </label>
      </fieldset>

      <button class="ondo-primary" type="submit">
        내 취향의 커피 찾기 ↗
      </button>
    </form>

    <div class="ondo-result" hidden aria-live="polite"></div>
  </section>
`;

document.body.appendChild(quizLayer);

function openQuiz() {
  quizLayer.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeQuiz() {
  quizLayer.classList.remove("open");
  unlockPageIfNoLayer();
}

$(".ondo-quiz-launch")?.addEventListener("click", openQuiz);

$(".ondo-quiz-x", quizLayer).addEventListener("click", closeQuiz);

quizLayer.addEventListener("click", (event) => {
  if (event.target === quizLayer) {
    closeQuiz();
  }
});

$(".ondo-quiz-form", quizLayer).addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  let key = formData.get("taste");
  const time = formData.get("time");

  // 저녁을 선택하면 디카페인을 우선 추천
  if (time === "evening") {
    key = "decaf";
  }

  const match = products.find((product) => product.key === key) || products[0];

  const result = $(".ondo-result", quizLayer);

  result.replaceChildren();
  result.hidden = false;

  const title = document.createElement("strong");
  title.textContent = `추천 커피: ${match.title}`;

  const description = document.createElement("p");
  description.textContent = `${match.notes}. ${
    time === "evening"
      ? "저녁에도 편안한 선택으로 추천해요."
      : "선택한 취향과 잘 어울리는 한 잔이에요."
  }`;

  const viewButton = document.createElement("button");

  viewButton.type = "button";
  viewButton.className = "ondo-primary";
  viewButton.textContent = "추천 원두 자세히 보기";

  viewButton.addEventListener("click", () => {
    closeQuiz();
    openDetails(match);
  });

  result.append(title, description, viewButton);
});

/* =========================================
   8. 장바구니 데이터와 저장
========================================= */

// 브라우저를 닫았다 다시 열어도 장바구니가 남도록 저장
const CART_KEY = "ondo-cart-v2";

function loadCart() {
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter(
      (item) =>
        item &&
        typeof item.name === "string" &&
        Number.isFinite(item.price) &&
        Number.isFinite(item.quantity) &&
        item.price >= 0 &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    showToast("장바구니를 저장하지 못했어요.");
  }
}

/* =========================================
   9. 장바구니 화면 생성
========================================= */

const cartButton = document.createElement("button");

cartButton.className = "ondo-cart-trigger";
cartButton.type = "button";
cartButton.setAttribute("aria-label", "장바구니 열기");

cartButton.innerHTML = `
  <span>장바구니</span>
  <span class="ondo-cart-count" aria-live="polite">0</span>
`;

const cartLayer = document.createElement("div");

cartLayer.className = "ondo-cart-layer";

cartLayer.innerHTML = `
  <section
    class="ondo-cart-panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="ondo-cart-title"
  >
    <header class="ondo-cart-head">
      <h2 id="ondo-cart-title">장바구니</h2>

      <button
        class="ondo-x ondo-cart-x"
        type="button"
        aria-label="장바구니 닫기"
      >×</button>
    </header>

    <div class="ondo-cart-items"></div>

    <footer class="ondo-cart-bottom">
      <div class="ondo-total">
        <span>총 상품 금액</span>
        <span class="ondo-total-value">0원</span>
      </div>

      <button class="ondo-checkout" type="button">
        주문하기
      </button>
    </footer>
  </section>
`;

document.body.append(cartButton, cartLayer);

const cartCountEl = $(".ondo-cart-count", cartButton);
const cartItemsEl = $(".ondo-cart-items", cartLayer);
const cartTotalEl = $(".ondo-total-value", cartLayer);
const checkoutButton = $(".ondo-checkout", cartLayer);

function countCartItems() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/* =========================================
   10. 장바구니에 상품 추가
========================================= */

function addToCart(product) {
  const existing = cart.find((item) => item.name === product.title);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      name: product.title,
      price: product.price,
      quantity: 1,
    });
  }

  saveCart();
  renderCart();

  showToast(`${product.title}을(를) 장바구니에 담았어요.`);
}

function openCart() {
  cartLayer.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartLayer.classList.remove("open");
  unlockPageIfNoLayer();
}

cartButton.addEventListener("click", openCart);

$(".ondo-cart-x", cartLayer).addEventListener("click", closeCart);

cartLayer.addEventListener("click", (event) => {
  if (event.target === cartLayer) {
    closeCart();
  }
});

/* =========================================
   11. 수량 변경과 상품 삭제
========================================= */

function changeQuantity(index, amount) {
  if (!cart[index]) return;

  cart[index].quantity += amount;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}

function renderCart() {
  cartCountEl.textContent = countCartItems();
  cartTotalEl.textContent = formatPrice(calculateTotal());

  checkoutButton.disabled = cart.length === 0;

  cartItemsEl.replaceChildren();

  // 장바구니가 비어 있을 때
  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "ondo-empty";
    emptyMessage.textContent =
      "아직 담긴 상품이 없어요. 마음에 드는 커피를 골라보세요 ☕";

    cartItemsEl.appendChild(emptyMessage);
    return;
  }

  cart.forEach((item, index) => {
    const row = document.createElement("article");
    row.className = "ondo-cart-row";

    const details = document.createElement("div");

    const name = document.createElement("div");
    name.className = "ondo-cart-row-name";
    name.textContent = item.name;

    const price = document.createElement("div");
    price.className = "ondo-cart-row-price";
    price.textContent = formatPrice(item.price * item.quantity);

    const controls = document.createElement("div");
    controls.className = "ondo-qty";

    const minusButton = document.createElement("button");
    minusButton.type = "button";
    minusButton.textContent = "−";
    minusButton.setAttribute("aria-label", `${item.name} 수량 줄이기`);

    minusButton.addEventListener("click", () => {
      changeQuantity(index, -1);
    });

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const plusButton = document.createElement("button");
    plusButton.type = "button";
    plusButton.textContent = "+";
    plusButton.setAttribute("aria-label", `${item.name} 수량 늘리기`);

    plusButton.addEventListener("click", () => {
      changeQuantity(index, 1);
    });

    controls.append(minusButton, quantity, plusButton);
    details.append(name, price, controls);

    const removeButton = document.createElement("button");

    removeButton.type = "button";
    removeButton.className = "ondo-remove";
    removeButton.textContent = "삭제";

    removeButton.addEventListener("click", () => {
      cart.splice(index, 1);

      saveCart();
      renderCart();

      showToast(`${item.name}을(를) 삭제했어요.`);
    });

    row.append(details, removeButton);
    cartItemsEl.appendChild(row);
  });
}

/* 기존 상품의 + 버튼과 장바구니 연결 */

$$(".add").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product");

    const product = products.find((item) => item.card === card);

    if (!product || !product.price) {
      showToast("상품 가격을 읽지 못했어요. HTML을 확인해 주세요.");
      return;
    }

    addToCart(product);
  });
});

/* 상세 팝업의 장바구니 버튼 */

$(".ondo-detail-add", detailLayer).addEventListener("click", () => {
  if (!selectedProduct) return;

  addToCart(selectedProduct);
  closeDetails();
});

/* 주문하기 버튼 — 실제 결제는 연결하지 않음 */

checkoutButton.addEventListener("click", () => {
  if (cart.length > 0) {
    showToast("주문 기능은 데모입니다. 실제 결제는 연결되지 않았어요.");
  }
});

// 페이지를 처음 열 때 저장된 장바구니 표시
renderCart();

/* =========================================
   12. 팝업을 닫았을 때 스크롤 복구
========================================= */

function unlockPageIfNoLayer() {
  const anyOpen =
    detailLayer.classList.contains("open") ||
    quizLayer.classList.contains("open") ||
    cartLayer.classList.contains("open");

  if (!anyOpen) {
    document.body.style.overflow = "";
  }
}

/* =========================================
   13. 섹션 스크롤 등장 애니메이션
========================================= */

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const revealTargets = $$(".story, .coffee, .origin, .closing");

if (!reduceMotion && "IntersectionObserver" in window) {
  revealTargets.forEach((element) => {
    element.classList.add("ondo-reveal");
  });

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
    },
  );

  revealTargets.forEach((element) => {
    observer.observe(element);
  });
}

/* =========================================
   14. 맨 위로 이동 버튼
========================================= */

const backTopButton = document.createElement("button");

backTopButton.className = "ondo-back-top";
backTopButton.type = "button";
backTopButton.textContent = "↑";
backTopButton.setAttribute("aria-label", "페이지 맨 위로 이동");

document.body.appendChild(backTopButton);

window.addEventListener(
  "scroll",
  () => {
    backTopButton.classList.toggle("visible", window.scrollY > 500);
  },
  { passive: true },
);

backTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: reduceMotion ? "auto" : "smooth",
  });
});

/* =========================================
   15. ESC 키로 팝업 닫기
========================================= */

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (cartLayer.classList.contains("open")) {
    closeCart();
  }

  if (detailLayer.classList.contains("open")) {
    closeDetails();
  }

  if (quizLayer.classList.contains("open")) {
    closeQuiz();
  }
});
