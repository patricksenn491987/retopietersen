(function () {
  const formatCHF = (value) => `CHF ${Number(value).toFixed(0)}`;

  const renderProductCard = (product) => {
    const alt = product.imageAlt || product.name;
    return `
      <article class="card reveal">
        <div class="product-meta">
          <span>${product.name}</span>
          <strong>${formatCHF(product.price)}</strong>
        </div>
        <img src="${product.image}" alt="${alt}" class="product-image" />
        <p>${product.description}</p>
        <div class="tag">${product.category}</div>
        <div class="hero-actions">
          <a class="btn ghost" href="/produkt.html?id=${product.id}">Details</a>
          <button class="btn primary">In den Warenkorb</button>
        </div>
      </article>
    `;
  };

  const mount = async () => {
    const response = await fetch('/data/products.json', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    const activeItems = items.filter((item) => item.active !== false);

    const featuredWrap = document.querySelector('[data-products-featured]');
    if (featuredWrap) {
      const featured = activeItems.filter((item) => item.featured).slice(0, 4);
      featuredWrap.innerHTML = featured.map(renderProductCard).join('');
    }

    const allWrap = document.querySelector('[data-products-grid]');
    if (allWrap) {
      allWrap.innerHTML = activeItems.map(renderProductCard).join('');
    }
  };

  mount();
})();
