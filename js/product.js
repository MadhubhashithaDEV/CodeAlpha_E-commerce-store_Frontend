/**
 * VELORA Product Details Page Controller
 */

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let selectedQuantity = 1;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = 'shop.html';
    return;
  }

  await loadProductDetails(productId);
});

async function loadProductDetails(productId) {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  try {
    const res = await apiRequest(`/products/${productId}`);
    if (!res.success || !res.data) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem;">
          <h2>Product Not Found</h2>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">The clothing item you are looking for does not exist or has been removed.</p>
          <a href="shop.html" class="btn btn-primary" style="margin-top: 1.5rem;">Back to Shop</a>
        </div>
      `;
      return;
    }

    currentProduct = res.data;
    selectedColor = currentProduct.colors ? currentProduct.colors[0] : 'Default';
    
    document.title = `${currentProduct.name} | VELORA`;

    const discountPct = currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price
      ? Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)
      : 0;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3.5rem;" class="product-detail-layout">
        
        <!-- Left: Image Gallery -->
        <div>
          <div style="position: relative; width: 100%; padding-top: 125%; background: var(--bg-subtle); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1rem;">
            <img id="main-product-img" src="${currentProduct.images[0]}" alt="${currentProduct.name}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover;">
          </div>
          
          <div style="display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem;">
            ${currentProduct.images.map((img, i) => `
              <div onclick="switchProductImage('${img}', this)" class="thumb-box ${i === 0 ? 'active' : ''}" style="width: 80px; height: 100px; flex-shrink: 0; border: 2px solid ${i === 0 ? 'var(--primary)' : 'var(--border-color)'}; border-radius: var(--radius-sm); overflow: hidden; cursor: pointer;">
                <img src="${img}" alt="Thumbnail" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Product Info & Purchase Options -->
        <div>
          <span class="product-category-gender" style="font-size: 0.85rem;">${currentProduct.gender} | ${currentProduct.category}</span>
          <h1 style="font-size: 2.2rem; margin: 0.4rem 0 0.8rem; line-height: 1.2;">${currentProduct.name}</h1>

          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
            <div class="product-rating" style="font-size: 1rem;">
              <i class="fas fa-star"></i> <span>${currentProduct.rating || 4.8}</span>
              <span class="rating-count">(${currentProduct.reviewsCount || 12} customer reviews)</span>
            </div>
            <span style="color: var(--border-color);">|</span>
            <span style="font-size: 0.85rem; font-weight: 600; color: ${currentProduct.stock > 0 ? 'var(--success)' : 'var(--danger)'};">
              <i class="fas ${currentProduct.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}"></i>
              ${currentProduct.stock > 0 ? `In Stock (${currentProduct.stock} items)` : 'Out of Stock'}
            </span>
          </div>

          <div class="product-price-row" style="margin-bottom: 1.5rem;">
            <span class="current-price" style="font-size: 1.75rem;">Rs. ${currentProduct.price.toLocaleString()}</span>
            ${currentProduct.originalPrice ? `<span class="original-price" style="font-size: 1.2rem;">Rs. ${currentProduct.originalPrice.toLocaleString()}</span>` : ''}
            ${discountPct > 0 ? `<span class="discount-percent" style="font-size: 0.9rem;">SAVE ${discountPct}%</span>` : ''}
          </div>

          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2rem; line-height: 1.7;">
            ${currentProduct.description}
          </p>

          <!-- Color Selector -->
          <div style="margin-bottom: 1.75rem;">
            <label class="form-label" style="font-weight: 600;">Selected Color: <span id="color-label" style="font-weight: 400;">${selectedColor}</span></label>
            <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
              ${currentProduct.colors.map((c, i) => `
                <button type="button" class="btn btn-secondary btn-sm ${i === 0 ? 'active-color' : ''}" style="border-radius: 20px; font-weight: 500;" onclick="selectColor('${c}', this)">
                  ${c}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Size Selector (REQUIRED) -->
          <div style="margin-bottom: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <label class="form-label" style="font-weight: 600; margin: 0;">Select Size <span style="color: var(--danger);">*</span></label>
              <button type="button" onclick="openSizeGuide()" style="font-size: 0.8rem; color: var(--accent); font-weight: 600; text-decoration: underline;">
                <i class="fas fa-ruler-horizontal"></i> Size Guide
              </button>
            </div>
            <div class="size-boxes" id="detail-size-boxes">
              ${currentProduct.sizes.map(s => `
                <button type="button" class="size-btn" style="width: 45px; height: 45px; font-size: 0.9rem;" data-size="${s}" onclick="selectDetailSize(this)">${s}</button>
              `).join('')}
            </div>
          </div>

          <!-- Quantity Picker -->
          <div style="margin-bottom: 2rem;">
            <label class="form-label" style="font-weight: 600;">Quantity</label>
            <div style="display: flex; align-items: center; gap: 0.5rem; width: 140px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.25rem;">
              <button type="button" class="icon-btn" onclick="updateDetailQty(-1)"><i class="fas fa-minus" style="font-size: 0.75rem;"></i></button>
              <input type="number" id="detail-qty-input" value="1" min="1" max="${currentProduct.stock}" style="width: 50px; text-align: center; font-weight: 600;" readonly>
              <button type="button" class="icon-btn" onclick="updateDetailQty(1)"><i class="fas fa-plus" style="font-size: 0.75rem;"></i></button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
            <button class="btn btn-primary btn-block" style="flex: 2; padding: 1rem;" ${currentProduct.stock <= 0 ? 'disabled' : ''} onclick="handleAddToCart()">
              <i class="fas fa-shopping-bag"></i> ADD TO CART
            </button>
            <button class="btn btn-accent btn-block" style="flex: 2; padding: 1rem;" ${currentProduct.stock <= 0 ? 'disabled' : ''} onclick="handleBuyNow()">
              <i class="fas fa-bolt"></i> BUY NOW
            </button>
            <button class="icon-btn" style="border: 1px solid var(--border-color); width: 50px; height: 50px; border-radius: var(--radius-sm);" onclick="showToast('Added to wishlist', 'success')">
              <i class="far fa-heart" style="font-size: 1.2rem;"></i>
            </button>
          </div>

          <!-- Product Perks -->
          <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem; color: var(--text-muted);">
            <div><i class="fas fa-truck" style="color: var(--accent); margin-right: 0.5rem;"></i> Free nationwide delivery on orders over Rs. 10,000</div>
            <div><i class="fas fa-rotate-left" style="color: var(--accent); margin-right: 0.5rem;"></i> 30-Day Hassle-Free Returns & Size Exchanges</div>
            <div><i class="fas fa-shield-alt" style="color: var(--accent); margin-right: 0.5rem;"></i> Guaranteed 100% Authentic VELORA Product</div>
          </div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
  }
}

function switchProductImage(src, thumbEl) {
  document.getElementById('main-product-img').src = src;
  document.querySelectorAll('.thumb-box').forEach(el => {
    el.style.borderColor = 'var(--border-color)';
  });
  thumbEl.style.borderColor = 'var(--primary)';
}

function selectColor(color, btn) {
  selectedColor = color;
  document.getElementById('color-label').textContent = color;
  document.querySelectorAll('.active-color').forEach(b => b.classList.remove('active-color'));
  btn.classList.add('active-color');
}

function selectDetailSize(btn) {
  document.querySelectorAll('#detail-size-boxes .size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSize = btn.dataset.size;
}

function updateDetailQty(delta) {
  const input = document.getElementById('detail-qty-input');
  let currentVal = parseInt(input.value) || 1;
  currentVal += delta;

  if (currentVal < 1) currentVal = 1;
  if (currentProduct && currentVal > currentProduct.stock) {
    showToast(`Only ${currentProduct.stock} items available in stock`, 'error');
    currentVal = currentProduct.stock;
  }

  input.value = currentVal;
  selectedQuantity = currentVal;
}

function handleAddToCart() {
  if (!selectedSize) {
    showToast('Please select a size (S, M, L, XL, XXL) before adding to cart', 'error');
    return;
  }

  if (currentProduct) {
    addToCart(currentProduct, selectedSize, selectedColor, selectedQuantity);
  }
}

function handleBuyNow() {
  if (!selectedSize) {
    showToast('Please select a size (S, M, L, XL, XXL) before buying', 'error');
    return;
  }

  if (currentProduct) {
    if (addToCart(currentProduct, selectedSize, selectedColor, selectedQuantity)) {
      window.location.href = 'checkout.html';
    }
  }
}

function openSizeGuide() {
  document.getElementById('size-guide-modal').classList.add('open');
}

function closeSizeGuide() {
  document.getElementById('size-guide-modal').classList.remove('open');
}
