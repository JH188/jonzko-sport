// ============================================================
// JONZKO SPORT - CATÁLOGO ESTÁTICO
// Para editar la tienda solo cambia estos datos.
// No usa API, base de datos, Angular, Java ni Railway.
// ============================================================

const CONFIG = {
  whatsappNumber: '51998989599', // Perú: 51 + número, sin + ni espacios
  generalMessage: 'Hola, quiero información sobre los productos de JONZKO SPORT.'
};

// Agrega, elimina o modifica productos aquí.
const PRODUCTS = [
  {
    id: 1,
    name: 'Polo básico negro',
    category: 'Polos',
    price: 29.99,
    oldPrice: 39.99,
    image: 'assets/polo-negro.pc.png',
    sizes: ['S', 'M', 'L'],
    description: 'Polo básico negro de corte limpio y cómodo para uso diario.',
    badge: 'OFERTA'
  },
  {
    id: 2,
    name: 'Polo básico blanco',
    category: 'Polos',
    price: 39.99,
    oldPrice: null,
    image: 'assets/polo-blanco11.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Polo blanco versátil, fácil de combinar y con estilo minimalista.',
    badge: ''
  },
  {
    id: 3,
    name: 'Polo JONZKO negro',
    category: 'Oversize',
    price: 69.99,
    oldPrice: 79.99,
    image: 'assets/polo-negro13.jpeg',
    sizes: ['M', 'L', 'XL'],
    description: 'Modelo urbano con caída amplia para un look oversize.',
    badge: 'OVERSIZE'
  },
  {
    id: 4,
    name: 'Polo manga larga negro',
    category: 'Polos',
    price: 59.99,
    oldPrice: null,
    image: 'assets/polo-manga-larga-negro-2.jpg',
    sizes: ['M', 'L', 'XL'],
    description: 'Manga larga en color negro, cómodo y fácil de combinar.',
    badge: ''
  },
  {
    id: 5,
    name: 'Polera JONZKO negra',
    category: 'Poleras',
    price: 89.99,
    oldPrice: 99.99,
    image: 'assets/polera-negra.jpg',
    sizes: ['M', 'L', 'XL'],
    description: 'Polera urbana negra con diseño JONZKO y estilo marcado.',
    badge: 'JONZKO'
  },
  {
    id: 6,
    name: 'Polera blanca',
    category: 'Poleras',
    price: 79.99,
    oldPrice: null,
    image: 'assets/polera-blanca.jpeg',
    sizes: ['M', 'L', 'XL'],
    description: 'Polera blanca de estilo urbano, ideal para outfits claros.',
    badge: ''
  },
  {
    id: 7,
    name: 'Polera morada',
    category: 'Poleras',
    price: 79.99,
    oldPrice: null,
    image: 'assets/polera-morada.jpeg',
    sizes: ['M', 'L', 'XL'],
    description: 'Polera morada con presencia urbana y ajuste cómodo.',
    badge: ''
  },
  {
    id: 8,
    name: 'Polera verde',
    category: 'Poleras',
    price: 79.99,
    oldPrice: null,
    image: 'assets/polera-verde.jpeg',
    sizes: ['M', 'L', 'XL'],
    description: 'Polera verde de colección JONZKO, cómoda y llamativa.',
    badge: ''
  }
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const money = value => `S/ ${Number(value).toFixed(2)}`;
const waUrl = message => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

// WhatsApp general
$$('[data-general-whatsapp]').forEach(link => {
  link.href = waUrl(CONFIG.generalMessage);
});

// Menú móvil
const menuBtn = $('#menuBtn');
const navLinks = $('#navLinks');
menuBtn?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? '×' : '☰';
});
$$('#navLinks a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.textContent = '☰';
}));

// Hero
const slides = $$('.hero-slide');
const dotsContainer = $('#heroDots');
let activeSlide = 0;
let heroTimer;

slides.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', `Ir a imagen ${index + 1}`);
  dot.addEventListener('click', () => showSlide(index, true));
  dotsContainer.appendChild(dot);
});

function showSlide(index, restart = false) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === activeSlide));
  $$('#heroDots button').forEach((dot, i) => dot.classList.toggle('active', i === activeSlide));
  if (restart) startHeroAuto();
}

function startHeroAuto() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => showSlide(activeSlide + 1), 6000);
}

$('#heroPrev')?.addEventListener('click', () => showSlide(activeSlide - 1, true));
$('#heroNext')?.addEventListener('click', () => showSlide(activeSlide + 1, true));
showSlide(0);
startHeroAuto();

// Catálogo
const productGrid = $('#productGrid');
const searchInput = $('#productSearch');
const emptyState = $('#emptyState');
let selectedCategory = 'Todos';

function productCard(product) {
  const oldPrice = product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : '';
  const badge = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';

  return `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        ${badge}
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-prices">${oldPrice}<span class="product-price">${money(product.price)}</span></div>
        <button class="product-button" type="button" data-product-id="${product.id}">VER / PEDIR POR WHATSAPP</button>
      </div>
    </article>`;
}

function renderProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && haystack.includes(term);
  });

  productGrid.innerHTML = filtered.map(productCard).join('');
  emptyState.hidden = filtered.length > 0;

  $$('[data-product-id]', productGrid).forEach(button => {
    button.addEventListener('click', () => openProduct(Number(button.dataset.productId)));
  });
}

$$('#categoryFilters .filter').forEach(button => {
  button.addEventListener('click', () => {
    $$('#categoryFilters .filter').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    selectedCategory = button.dataset.category;
    renderProducts();
  });
});
searchInput.addEventListener('input', renderProducts);
renderProducts();

// Modal producto
const modal = $('#productModal');
const modalImage = $('#modalProductImage');
const modalCategory = $('#modalProductCategory');
const modalName = $('#modalProductName');
const modalDescription = $('#modalProductDescription');
const modalPrice = $('#modalProductPrice');
const modalOldPrice = $('#modalOldPrice');
const sizeSelect = $('#sizeSelect');
const quantityInput = $('#quantityInput');
const buyWhatsapp = $('#buyWhatsapp');
let currentProduct = null;

function openProduct(id) {
  currentProduct = PRODUCTS.find(product => product.id === id);
  if (!currentProduct) return;

  modalImage.src = currentProduct.image;
  modalImage.alt = currentProduct.name;
  modalCategory.textContent = currentProduct.category;
  modalName.textContent = currentProduct.name;
  modalDescription.textContent = currentProduct.description;
  modalPrice.textContent = money(currentProduct.price);
  modalOldPrice.textContent = currentProduct.oldPrice ? money(currentProduct.oldPrice) : '';
  modalOldPrice.style.display = currentProduct.oldPrice ? '' : 'none';
  sizeSelect.innerHTML = '<option value="">Selecciona una talla</option>' +
    currentProduct.sizes.map(size => `<option value="${size}">${size}</option>`).join('');
  quantityInput.value = 1;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  currentProduct = null;
}

$$('[data-close-modal]').forEach(element => element.addEventListener('click', closeModal));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

function normalizeQty() {
  const value = Math.min(20, Math.max(1, Number.parseInt(quantityInput.value, 10) || 1));
  quantityInput.value = value;
  return value;
}
$('#qtyMinus')?.addEventListener('click', () => { quantityInput.value = Math.max(1, normalizeQty() - 1); });
$('#qtyPlus')?.addEventListener('click', () => { quantityInput.value = Math.min(20, normalizeQty() + 1); });
quantityInput.addEventListener('change', normalizeQty);

buyWhatsapp.addEventListener('click', () => {
  if (!currentProduct) return;
  const size = sizeSelect.value;
  if (!size) {
    sizeSelect.focus();
    alert('Selecciona una talla para continuar.');
    return;
  }

  const quantity = normalizeQty();
  const total = currentProduct.price * quantity;
  const message = `Hola, quiero realizar un pedido en JONZKO SPORT.\n\n` +
    `Producto: ${currentProduct.name}\n` +
    `Talla: ${size}\n` +
    `Cantidad: ${quantity}\n` +
    `Precio: ${money(currentProduct.price)}\n` +
    `Total: ${money(total)}\n\n` +
    `¿Me confirman disponibilidad y cómo coordinamos la entrega?`;

  window.open(waUrl(message), '_blank', 'noopener');
});

$('#year').textContent = new Date().getFullYear();
