(function () {
  const qs = (selector) => document.querySelector(selector);
  const formatCHF = (value) => `CHF ${Number(value).toFixed(0)}`;

  const getCart = () => JSON.parse(localStorage.getItem('reto-cart') || '[]');
  const setCart = (cart) => localStorage.setItem('reto-cart', JSON.stringify(cart));

  const updateCartUI = () => {
    const badge = qs('[data-cart-count]');
    if (badge) {
      const count = getCart().reduce((sum, item) => sum + item.qty, 0);
      badge.textContent = count;
    }
    const list = qs('[data-cart-items]');
    const totalEl = qs('[data-cart-total]');
    if (!list || !totalEl) return;
    const cart = getCart();
    let total = 0;
    list.innerHTML = '';
    cart.forEach((item) => {
      total += item.price * item.qty;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <div class="muted small">${formatCHF(item.price)} · x${item.qty}</div>
        </div>
        <button class="icon-btn" data-remove-id="${item.id}">Entfernen</button>
      `;
      list.appendChild(row);
    });
    totalEl.textContent = formatCHF(total);
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
    updateCartUI();
    document.dispatchEvent(new CustomEvent('cart:updated'));
  };

  const setMeta = (product) => {
    document.title = `${product.name} · Reto Pietersen`;
    const desc = `${product.description}`;
    const metaDesc = qs('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);

    const ogTitle = qs('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', product.name);
    const ogDesc = qs('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
    const ogImage = qs('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', product.image);
    const ogUrl = qs('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);

    const jsonld = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: [product.image],
      sku: product.sku || undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'CHF',
        price: String(product.price),
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: window.location.href
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonld);
    document.head.appendChild(script);
  };

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
          <button class="btn primary" data-add-to-cart>In den Warenkorb</button>
        </div>
      </div>
    `;

    const addBtn = qs('[data-add-to-cart]');
    if (addBtn) addBtn.addEventListener('click', () => addToCart(product));
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
    setMeta(product);
    updateCartUI();
  };

  mount();
})();
