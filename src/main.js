import "./styles.css";
import { products } from "./data/products";

const formatPrice = (value) => `${value.toFixed(2)} CHF`;

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

const getCart = () => JSON.parse(localStorage.getItem("reto-cart") || "[]");
const setCart = (cart) => localStorage.setItem("reto-cart", JSON.stringify(cart));

const updateCartBadge = () => {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  const badge = qs("[data-cart-count]");
  if (badge) badge.textContent = count;
};

const renderCart = () => {
  const list = qs("[data-cart-items]");
  const totalEl = qs("[data-cart-total]");
  if (!list || !totalEl) return;

  const cart = getCart();
  list.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.qty;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="muted small">${formatPrice(item.price)}  x${item.qty}</div>
      </div>
      <button class="icon-btn" data-remove-id="${item.id}">Entfernen</button>
    `;
    list.appendChild(row);
  });

  totalEl.textContent = formatPrice(total);
};

const addToCart = (product) => {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }
  setCart(cart);
  updateCartBadge();

// Sync cart updates from other scripts
document.addEventListener("cart:updated", () => {
  updateCartBadge();
  renderCart();
});
  renderCart();
};

const setupCartDrawer = () => {
  const drawer = qs("[data-cart-drawer]");
  const overlay = qs("[data-cart-overlay]");
  const openBtn = qs("[data-cart-open]");
  const closeBtn = qs("[data-cart-close]");

  if (!drawer || !overlay || !openBtn || !closeBtn) return;

  const open = () => {
    drawer.classList.add("open");
    overlay.classList.add("show");
  };

  const close = () => {
    drawer.classList.remove("open");
    overlay.classList.remove("show");
  };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);

  drawer.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const id = target.getAttribute("data-remove-id");
    if (!id) return;
    const cart = getCart().filter((item) => item.id !== id);
    setCart(cart);
    updateCartBadge();
    renderCart();
  });

  updateCartBadge();
  renderCart();
};

const setupQuickview = () => {
  const modal = qs("[data-quickview]");
  const closeBtn = qs("[data-quickview-close]");
  if (!modal || !closeBtn) return;

  const close = () => {
    modal.classList.remove("open");
  };

  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
};

const openQuickview = (product) => {
  const modal = qs("[data-quickview]");
  if (!modal) return;
  const title = qs("[data-quickview-title]");
  const price = qs("[data-quickview-price]");
  const desc = qs("[data-quickview-desc]");
  const list = qs("[data-quickview-list]");
  const addBtn = qs("[data-quickview-add]");

  if (!title || !price || !desc || !list || !addBtn) return;

  title.textContent = product.name;
  price.textContent = formatPrice(product.price);
  desc.textContent = product.description;
  list.innerHTML = product.highlights.map((item) => `<li>${item}</li>`).join("");
  addBtn.onclick = () => addToCart(product);

  modal.classList.add("open");
};

const renderProducts = () => {
  const grid = qs("[data-products]");
  const filters = qs("[data-filters]");
  if (!grid || !filters) return;

  const categories = ["Alle", ...new Set(products.map((item) => item.category))];
  filters.innerHTML = categories
    .map(
      (cat, index) =>
        `<button class="filter-btn${index === 0 ? " active" : ""}" data-filter="${cat}">${cat}</button>`
    )
    .join("");

  const draw = (filter) => {
    const visible = filter === "Alle" ? products : products.filter((p) => p.category === filter);
    grid.innerHTML = visible
      .map(
        (product) => `
      <article class="card product-card reveal">
        <div class="product-meta">
          <span>${product.name}</span>
          <strong>${formatPrice(product.price)}</strong>
        </div>
        <p>${product.description}</p>
        <div class="tag">${product.category}</div>
        <div class="hero-actions">
          <button class="btn primary" data-add-id="${product.id}">In den Warenkorb</button>
          <button class="btn ghost" data-view-id="${product.id}">Details</button>
        </div>
      </article>
    `
      )
      .join("");
  };

  draw("Alle");

  filters.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const filter = target.getAttribute("data-filter");
    if (!filter) return;
    qsa(".filter-btn").forEach((btn) => btn.classList.remove("active"));
    target.classList.add("active");
    draw(filter);
    setupReveal();
  });

  grid.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const addId = target.getAttribute("data-add-id");
    const viewId = target.getAttribute("data-view-id");
    if (addId) {
      const product = products.find((item) => item.id === addId);
      if (product) addToCart(product);
    }
    if (viewId) {
      const product = products.find((item) => item.id === viewId);
      if (product) openQuickview(product);
    }
  });
};

const setupParallax = () => {
  const hero = qs(".hero");
  if (!hero) return;
  window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.18;
    hero.style.backgroundPosition = `center ${offset}px`;
  });
};

const setupReveal = () => {
  const items = qsa(".reveal");
  if (!items.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((item) => observer.observe(item));
};

renderProducts();
setupQuickview();
setupCartDrawer();
setupParallax();
setupReveal();
updateCartBadge();
