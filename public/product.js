(function () {
  const qs = (selector) => document.querySelector(selector);
  const formatCHF = (value) => `CHF ${Number(value).toFixed(0)}`;

  const renderDetail = (product) => {
    const wrapper = qs('[data-product-detail]');
    if (!wrapper) return;

    wrapper.innerHTML = `
      <div class="product-detail-image">
        <img src="${product.image}" alt="${product.imageAlt || product.name}" />
      </div>
      <div class="product-detail-info">
        <p class="eyebrow">${product.category}</p>
        <h1>${product.name}</h1>
        <p class="lead">${product.description}</p>
        <div class="product-detail-meta">
          <div>
            <span>SKU</span>
            <strong>${product.sku || '-'}</strong>
          </div>
          <div>
            <span>Material</span>
            <strong>${product.material || '-'}</strong>
          </div>
          <div>
            <span>Gewicht</span>
            <strong>${product.weight ? `${product.weight} g` : '-'}</strong>
          </div>
          <div>
            <span>Laenge</span>
            <strong>${product.length ? `${product.length} cm` : '-'}</strong>
          </div>
          <div>
            <span>Bestand</span>
            <strong>${product.stock ?? '-'}</strong>
          </div>
        </div>
        <div class="product-detail-actions">
          <div class="price">${formatCHF(product.price)}</div>
          <button class="btn primary">In den Warenkorb</button>
        </div>
      </div>
    `;
  };

  const renderMissing = () => {
    const wrapper = qs('[data-product-detail]');
    if (!wrapper) return;
    wrapper.innerHTML = `
      <div class="product-detail-image"></div>
      <div class="product-detail-info">
        <p class="eyebrow">Produkt</p>
        <h1>Nicht gefunden</h1>
        <p class="lead">Dieses Produkt existiert nicht oder ist nicht aktiv.</p>
        <a class="btn ghost" href="/shop.html">Zurueck zum Shop</a>
      </div>
    `;
  };

  const mount = async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      renderMissing();
      return;
    }

    const response = await fetch('/data/products.json', { cache: 'no-store' });
    if (!response.ok) {
      renderMissing();
      return;
    }
    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    const product = items.find((item) => item.id === id && item.active !== false);
    if (!product) {
      renderMissing();
      return;
    }

    renderDetail(product);
  };

  mount();
})();
