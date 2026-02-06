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
    if (!allWrap) return;

    const filtersWrap = document.querySelector('[data-filters]');
    const searchInput = document.querySelector('[data-search]');

    const categories = ['Alle', ...new Set(activeItems.map((item) => item.category))];
    let currentFilter = 'Alle';
    let searchValue = '';

    const draw = () => {
      const filtered = activeItems.filter((item) => {
        const matchesCategory = currentFilter === 'Alle' || item.category === currentFilter;
        const matchesSearch = !searchValue || item.name.toLowerCase().includes(searchValue) || item.description.toLowerCase().includes(searchValue);
        return matchesCategory && matchesSearch;
      });
      allWrap.innerHTML = filtered.map(renderProductCard).join('');
    };

    if (filtersWrap) {
      filtersWrap.innerHTML = categories
        .map(
          (cat, index) =>
            `<button class="filter-btn${index === 0 ? ' active' : ''}" data-filter="${cat}">${cat}</button>`
        )
        .join('');

      filtersWrap.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const filter = target.getAttribute('data-filter');
        if (!filter) return;
        currentFilter = filter;
        filtersWrap.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
        target.classList.add('active');
        draw();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        const value = event.target.value || '';
        searchValue = value.toLowerCase().trim();
        draw();
      });
    }

    draw();
  };

  mount();
})();
