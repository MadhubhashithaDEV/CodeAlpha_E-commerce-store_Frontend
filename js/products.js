/**
 * VELORA Shop Page & Product Catalog Controller
 */

let currentProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  initShopPage();
});

async function initShopPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search') || '';
  const categoryParam = urlParams.get('category') || '';
  const genderParam = urlParams.get('gender') || '';

  // Set initial filter form values from URL if present
  const searchInput = document.getElementById('shop-search');
  if (searchInput && searchParam) searchInput.value = searchParam;

  const categorySelect = document.getElementById('filter-category');
  if (categorySelect && categoryParam) categorySelect.value = categoryParam;

  const genderSelect = document.getElementById('filter-gender');
  if (genderSelect && genderParam) genderSelect.value = genderParam;

  await fetchAndRenderProducts();
}

async function fetchAndRenderProducts() {
  const grid = document.getElementById('shop-products-grid');
  const countEl = document.getElementById('products-count');
  
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
      <i class="fas fa-spinner fa-spin fa-3x"></i>
      <p style="margin-top: 1rem; font-size: 1.1rem;">Loading VELORA Collection...</p>
    </div>
  `;

  try {
    const search = document.getElementById('shop-search')?.value.trim() || '';
    const category = document.getElementById('filter-category')?.value || '';
    const gender = document.getElementById('filter-gender')?.value || '';
    const sort = document.getElementById('filter-sort')?.value || 'newest';
    const minPrice = document.getElementById('filter-min-price')?.value || '';
    const maxPrice = document.getElementById('filter-max-price')?.value || '';

    // Selected size check
    const selectedSizeBtn = document.querySelector('.size-btn.selected');
    const size = selectedSizeBtn ? selectedSizeBtn.dataset.size : '';

    let queryString = `?sort=${sort}`;
    if (search) queryString += `&search=${encodeURIComponent(search)}`;
    if (category) queryString += `&category=${encodeURIComponent(category)}`;
    if (gender) queryString += `&gender=${encodeURIComponent(gender)}`;
    if (size) queryString += `&size=${encodeURIComponent(size)}`;
    if (minPrice) queryString += `&minPrice=${minPrice}`;
    if (maxPrice) queryString += `&maxPrice=${maxPrice}`;

    const res = await apiRequest(`/products${queryString}`);

    if (res.success) {
      currentProducts = res.data;

      if (countEl) countEl.textContent = `Showing ${res.data.length} products`;

      if (res.data.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 5rem 1rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <i class="fas fa-search-minus fa-3x" style="color: var(--accent); margin-bottom: 1rem;"></i>
            <h3>No products found</h3>
            <p style="color: var(--text-muted); margin-top: 0.5rem; max-width: 400px; margin-left: auto; margin-right: auto;">We couldn't find any products matching your current search or filter criteria.</p>
            <button onclick="resetShopFilters()" class="btn btn-secondary" style="margin-top: 1.5rem;">Reset Filters</button>
          </div>
        `;
        return;
      }

      grid.innerHTML = res.data.map(p => renderProductCard(p)).join('');
    }
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--danger);">
        <i class="fas fa-exclamation-triangle fa-2x"></i>
        <p style="margin-top: 1rem;">Failed to load products. Please check server connection.</p>
      </div>
    `;
  }
}

function renderProductCard(p) {
  const discountPct = p.originalPrice && p.originalPrice > p.price
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    : 0;

  return `
    <div class="product-card">
      <div class="product-image-wrap">
        <a href="product.html?id=${p._id}">
          <img src="${p.images[0]}" alt="${p.name}">
        </a>
        <div class="product-badges">
          ${discountPct > 0 ? `<span class="badge badge-sale">-${discountPct}%</span>` : ''}
          ${p.featured ? `<span class="badge badge-new">HOT</span>` : ''}
        </div>
        <button class="product-wishlist-btn" onclick="showToast('Added to wishlist', 'success')">
          <i class="far fa-heart"></i>
        </button>

        <div class="product-actions-overlay">
          <button class="btn btn-primary btn-sm btn-block" onclick="openQuickView('${p._id}')">
            <i class="fas fa-eye"></i> Quick View
          </button>
        </div>
      </div>

      <div class="product-details-content">
        <span class="product-category-gender">${p.gender} | ${p.category}</span>
        <h3 class="product-title"><a href="product.html?id=${p._id}">${p.name}</a></h3>

        <div class="product-rating">
          <i class="fas fa-star"></i> <span>${p.rating || '4.8'}</span>
          <span class="rating-count">(${p.reviewsCount || 12})</span>
        </div>

        <div class="product-price-row">
          <span class="current-price">Rs. ${p.price.toLocaleString()}</span>
          ${p.originalPrice ? `<span class="original-price">Rs. ${p.originalPrice.toLocaleString()}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function toggleSizeFilter(btn) {
  const allSizeBtns = document.querySelectorAll('.filter-sidebar .size-btn');
  if (btn.classList.contains('selected')) {
    btn.classList.remove('selected');
  } else {
    allSizeBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }
  fetchAndRenderProducts();
}

function resetShopFilters() {
  document.getElementById('shop-search').value = '';
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-gender').value = '';
  document.getElementById('filter-sort').value = 'newest';
  document.getElementById('filter-min-price').value = '';
  document.getElementById('filter-max-price').value = '';

  document.querySelectorAll('.filter-sidebar .size-btn').forEach(b => b.classList.remove('selected'));

  fetchAndRenderProducts();
}

async function openQuickView(productId) {
  try {
    const res = await apiRequest(`/products/${productId}`);
    if (!res.success) return;

    const p = res.data;
    const modal = document.getElementById('quick-view-modal');
    const content = document.getElementById('quick-view-content');

    if (!modal || !content) return;

    content.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div>
          <img id="qv-main-img" src="${p.images[0]}" alt="${p.name}" style="width: 100%; height: 350px; object-fit: cover; border-radius: var(--radius-md);">
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
            ${p.images.map(img => `<img src="${img}" style="width: 60px; height: 60px; object-fit: cover; cursor: pointer; border-radius: 4px;" onclick="document.getElementById('qv-main-img').src='${img}'">`).join('')}
          </div>
        </div>
        <div>
          <span class="product-category-gender">${p.gender} | ${p.category}</span>
          <h2 style="font-size: 1.5rem; margin: 0.3rem 0;">${p.name}</h2>
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem;">
            Rs. ${p.price.toLocaleString()}
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">${p.description}</p>

          <div style="margin-bottom: 1.25rem;">
            <label class="form-label">Select Size <span style="color: var(--danger);">*</span></label>
            <div class="size-boxes" id="qv-size-boxes">
              ${p.sizes.map(s => `<button type="button" class="size-btn" onclick="selectQVSize(this)" data-size="${s}">${s}</button>`).join('')}
            </div>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label class="form-label">Stock Status</label>
            <span style="font-weight: 600; color: ${p.stock > 0 ? 'var(--success)' : 'var(--danger)'};">
              ${p.stock > 0 ? `In Stock (${p.stock} units available)` : 'Out of Stock'}
            </span>
          </div>

          <button id="qv-add-btn" class="btn btn-primary btn-block" ${p.stock <= 0 ? 'disabled' : ''} onclick="submitQVAddToCart('${p._id}')">
            <i class="fas fa-shopping-bag"></i> ADD TO CART
          </button>
        </div>
      </div>
    `;

    modal.classList.add('open');
  } catch (err) {
    showToast('Failed to load product preview', 'error');
  }
}

let qvSelectedSize = null;

function selectQVSize(btn) {
  document.querySelectorAll('#qv-size-boxes .size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  qvSelectedSize = btn.dataset.size;
}

async function submitQVAddToCart(productId) {
  if (!qvSelectedSize) {
    showToast('Please select a clothing size before adding to cart', 'error');
    return;
  }

  const p = currentProducts.find(item => item._id === productId);
  if (p) {
    if (addToCart(p, qvSelectedSize, p.colors[0], 1)) {
      closeQuickView();
    }
  }
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (modal) modal.classList.remove('open');
  qvSelectedSize = null;
}
