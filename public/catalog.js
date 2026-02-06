(function () {
  const formatCHF = (value) => `CHF ${Number(value).toFixed(0)}`;

  const renderProductCard = (product) => {
    return `
      <article class="card reveal">
        <div class="product-meta">
          <span>${product.name}</span>
          <strong>${formatCHF(product.price)}</strong>
        </div>
        <img src="${product.image}" alt="${product.name}" class="product-image" />
        <p>${product.description}</p>
        <div class="tag">${product.category}</div>
        <div class="hero-actions">
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

    const featuredWrap = document.querySelector('[data-products-featured]');
    if (featuredWrap) {
      const featured = items.filter((item) => item.featured).slice(0, 4);
      featuredWrap.innerHTML = featured.map(renderProductCard).join('');
    }

    const allWrap = document.querySelector('[data-products-grid]');
    if (allWrap) {
      allWrap.innerHTML = items.map(renderProductCard).join('');
    }
  };

  mount();
})();
