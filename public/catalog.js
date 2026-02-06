(function () {
  const formatCHF = (value) => `CHF ${Number(value).toFixed(0)}`;

  const renderProductCard = (product) => {
    return `
      <div class="col">
        <div class="product-item">
          <div class="product-thumb">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <span class="qty">${product.category}</span>
          <h3>${product.name}</h3>
          <p class="text-body-secondary mb-2">${product.description}</p>
          <span class="price">${formatCHF(product.price)}</span>
          <button class="btn btn-primary w-100 mt-3">In den Warenkorb</button>
        </div>
      </div>
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
