/**
 * VELORA Shopping Cart Manager (localStorage Sync)
 */

function getCart() {
  const cartStr = localStorage.getItem('velora_cart');
  return cartStr ? JSON.parse(cartStr) : [];
}

function saveCart(cart) {
  localStorage.setItem('velora_cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, size, color, quantity = 1) {
  if (!size) {
    showToast('Please select a clothing size (S, M, L, XL, XXL)', 'error');
    return false;
  }

  const cart = getCart();

  // Find existing item with exact same productId AND size AND color
  const existingIndex = cart.findIndex(
    item => item.productId === (product._id || product.id) && item.size === size && item.color === color
  );

  if (existingIndex > -1) {
    const totalQty = cart[existingIndex].quantity + quantity;
    if (totalQty > (product.stock || 99)) {
      showToast(`Cannot add more. Maximum available stock is ${product.stock}`, 'error');
      return false;
    }
    cart[existingIndex].quantity = totalQty;
  } else {
    cart.push({
      productId: product._id || product.id,
      name: product.name,
      image: product.images ? product.images[0] : (product.image || ''),
      price: product.price,
      size: size,
      color: color || (product.colors ? product.colors[0] : 'Standard'),
      quantity: quantity,
      stock: product.stock !== undefined ? product.stock : 10
    });
  }

  saveCart(cart);
  showToast(`Added "${product.name}" (${size}) to cart`, 'success');
  return true;
}

function updateCartItemQty(index, newQty) {
  const cart = getCart();
  if (index < 0 || index >= cart.length) return;

  if (newQty <= 0) {
    removeFromCart(index);
    return;
  }

  if (newQty > cart[index].stock) {
    showToast(`Only ${cart[index].stock} units available in stock`, 'error');
    return;
  }

  cart[index].quantity = newQty;
  saveCart(cart);
}

function removeFromCart(index) {
  const cart = getCart();
  if (index >= 0 && index < cart.length) {
    const removedName = cart[index].name;
    cart.splice(index, 1);
    saveCart(cart);
    showToast(`Removed "${removedName}" from cart`, 'info');
  }
}

function clearCart() {
  localStorage.removeItem('velora_cart');
  updateCartBadge();
}

function getCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 10000 || subtotal === 0 ? 0 : 500;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return {
    subtotal,
    shipping,
    discount,
    total,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0)
  };
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count-badge');
  if (badge) {
    const totals = getCartTotals();
    badge.textContent = totals.itemCount;
    badge.style.display = totals.itemCount > 0 ? 'flex' : 'none';
  }
}
