let cart = [];

function loadCart() {
  const saved = localStorage.getItem('anishCart');
  if (saved) cart = JSON.parse(saved);
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('anishCart', JSON.stringify(cart));
  updateCartUI();
}

function addProductToCart() {
  document.querySelectorAll('.add-product').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      const item = {
        id: Date.now(),
        type: 'product',
        name: btn.dataset.name,
        price: parseInt(btn.dataset.price),
        size: card.querySelector('.p-size').value,
        color: card.querySelector('.p-color').value,
        qty: parseInt(card.querySelector('.p-qty').value),
      };

      if (item.qty < 1) return alert('Enter valid quantity');
      cart.push(item);
      saveCart();
      btn.textContent = '✓ Added!';
      setTimeout(() => btn.textContent = 'Add to cart', 1500);
    });
  });
}

function setupCustomForm() {
  const designUpload = document.getElementById('designUpload');
  const uploadBox = document.querySelector('.upload-box');
  const previewWrap = document.getElementById('previewWrap');
  const designPreview = document.getElementById('designPreview');
  const customForm = document.getElementById('customForm');

  uploadBox.addEventListener('click', () => designUpload.click());
  designUpload.addEventListener('change', () => {
    const file = designUpload.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        designPreview.src = e.target.result;
        previewWrap.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  customForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cName').value;
    const phone = document.getElementById('cPhone').value;
    const qty = parseInt(document.getElementById('cQty').value);
    const size = document.getElementById('cSize').value;
    const color = document.getElementById('cColor').value;
    const printSize = document.getElementById('printSize').value;

    if (!name || !phone || !size || !color || !printSize) return alert('Fill all fields');
    if (!/^\d{10}$/.test(phone)) return alert('Enter valid 10-digit phone');
    if (!designUpload.files[0]) return alert('Upload design image');

    const prices = { 'A5': 749, 'A4': 799, 'Large': 849 };
    const pricePerShirt = prices[printSize];

    cart.push({
      id: Date.now(),
      type: 'custom',
      designFile: designUpload.files[0].name,
      name,
      phone,
      qty,
      size,
      color,
      printSize,
      pricePerShirt,
      totalPrice: pricePerShirt * qty,
    });

    saveCart();
    customForm.reset();
    designUpload.value = '';
    previewWrap.classList.add('hidden');
  });
}

function updateCartUI() {
  document.getElementById('cartCount').textContent = cart.length;
  const cartItems = document.getElementById('cartItems');

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty">Your cart is empty.</p>';
    document.getElementById('cartTotal').textContent = '₹0';
    return;
  }

  let total = 0;
  cartItems.innerHTML = '';
  cart.forEach(item => {
    const itemPrice = item.type === 'product' ? item.price * item.qty : item.totalPrice;
    const html = `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.size} · ${item.color} · Qty: ${item.qty}</p>
        </div>
        <div class="cart-item-price">₹${itemPrice}</div>
        <button class="cart-item-remove" data-id="${item.id}">×</button>
      </div>
    `;
    cartItems.innerHTML += html;
    total += itemPrice;
  });

  document.getElementById('cartTotal').textContent = `₹${total}`;
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      cart = cart.filter(item => item.id !== parseInt(btn.dataset.id));
      saveCart();
    });
  });
}

function setupCheckoutForm() {
  const checkoutForm = document.getElementById('checkoutForm');
  const modal = document.getElementById('confirmModal');

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Cart is empty');

    const name = document.getElementById('oName').value;
    const phone = document.getElementById('oPhone').value;
    const address = document.getElementById('oAddress').value;

    if (!name || !phone || !address) return alert('Fill all fields');
    if (!/^\d{10}$/.test(phone)) return alert('Enter valid 10-digit phone');

    showConfirmation(name, phone, address);
  });

  document.getElementById('closeModal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

function showConfirmation(name, phone, address) {
  const orderId = 'ANI-' + Date.now().toString().slice(-8);
  let total = 0;
  let summary = '';

  cart.forEach(item => {
    const itemTotal = item.type === 'product' ? item.price * item.qty : item.totalPrice;
    summary += `<div class="summary-item"><span>${item.name}</span><span>₹${itemTotal}</span></div>`;
    total += itemTotal;
  });

  summary += `<div class="summary-item"><span>Total</span><span>₹${total}</span></div>`;

  document.getElementById('orderId').textContent = `Order ID: ${orderId}`;
  document.getElementById('confirmSummary').innerHTML = summary;

  const msg = buildWhatsAppMessage(name, phone, address, orderId);
  document.getElementById('whatsappBtn').href = `https://wa.me/918237715700?text=${encodeURIComponent(msg)}`;
  document.getElementById('confirmModal').classList.remove('hidden');
}

function buildWhatsAppMessage(name, phone, address, orderId) {
  let message = `*ANISH ATELIER Order*\nOrder ID: ${orderId}\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\n*Items*\n`;
  let total = 0;

  cart.forEach((item, i) => {
    const price = item.type === 'product' ? item.price * item.qty : item.totalPrice;
    message += `${i + 1}. ${item.name} - ₹${price}\n`;
    total += price;
  });

  message += `\n*Total: ₹${total}*`;
  return message;
}

function setupPayment() {
  document.getElementById('copyUpi').addEventListener('click', () => {
    navigator.clipboard.writeText('8237715700@fam');
    const btn = event.target;
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  addProductToCart();
  setupCustomForm();
  setupCheckoutForm();
  setupPayment();
  setupSmoothScroll();
});