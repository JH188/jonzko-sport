// ============================================================
// JONZKO - CATÁLOGO ESTÁTICO
// ============================================================
// No usa API, base de datos, Angular, Java ni Railway.
//
// PARA AGREGAR PRODUCTOS:
// Solo agrega un nuevo objeto dentro de PRODUCTS.
// La paginación se calculará automáticamente.
//
// EJEMPLO:
// 8 productos  = 1 página
// 16 productos = 2 páginas
// 24 productos = 3 páginas
//
// Esto también funciona por categoría:
// Polos, Poleras, Oversize, etc.
// ============================================================


// ============================================================
// CONFIGURACIÓN GENERAL
// ============================================================

const CONFIG = {
  whatsappNumber: '51998989599',

  generalMessage:
    'Hola, quiero información sobre los productos de JONZKO.'
};


// ============================================================
// PRODUCTOS
// ============================================================

const PRODUCTS = [

  {
    id: 1,
    name: 'Polo básico negro',
    category: 'Polos',

    price: 29.99,
    oldPrice: 39.99,

    image: 'assets/polo-negro.pc.png',

    sizes: ['S', 'M', 'L'],

    description:
      'Polo básico negro de corte limpio y cómodo para uso diario.',

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

    description:
      'Polo blanco versátil, fácil de combinar y con estilo minimalista.',

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

    description:
      'Modelo urbano con caída amplia para un look oversize.',

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

    description:
      'Manga larga en color negro, cómodo y fácil de combinar.',

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

    description:
      'Polera urbana negra con diseño JONZKO y estilo marcado.',

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

    description:
      'Polera blanca de estilo urbano, ideal para outfits claros.',

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

    description:
      'Polera morada con presencia urbana y ajuste cómodo.',

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

    description:
      'Polera verde de colección JONZKO, cómoda y llamativa.',

    badge: ''
  }

];


// ============================================================
// FUNCIONES RÁPIDAS
// ============================================================

const $ = (selector, root = document) =>
  root.querySelector(selector);


const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];


// Formato de precio
const money = value =>
  `S/ ${Number(value).toFixed(2)}`;


// Crear enlace WhatsApp
const waUrl = message =>
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;


// ============================================================
// WHATSAPP GENERAL
// ============================================================

$$('[data-general-whatsapp]').forEach(link => {

  link.href =
    waUrl(CONFIG.generalMessage);

});


// ============================================================
// MENÚ MÓVIL
// ============================================================

const menuBtn =
  $('#menuBtn');


const navLinks =
  $('#navLinks');


menuBtn?.addEventListener(
  'click',
  () => {

    const open =
      navLinks.classList.toggle('open');


    menuBtn.setAttribute(
      'aria-expanded',
      String(open)
    );


    menuBtn.textContent =
      open ? '×' : '☰';

  }
);


// Cerrar menú al seleccionar opción
$$('#navLinks a').forEach(link => {

  link.addEventListener(
    'click',
    () => {

      navLinks.classList.remove(
        'open'
      );


      menuBtn?.setAttribute(
        'aria-expanded',
        'false'
      );


      if (menuBtn) {

        menuBtn.textContent =
          '☰';

      }

    }
  );

});


// ============================================================
// CARRUSEL PRINCIPAL
// ============================================================

const slides =
  $$('.hero-slide');


const dotsContainer =
  $('#heroDots');


let activeSlide = 0;

let heroTimer;


// Crear puntos
slides.forEach(
  (_, index) => {

    const dot =
      document.createElement(
        'button'
      );


    dot.type =
      'button';


    dot.setAttribute(
      'aria-label',
      `Ir a imagen ${index + 1}`
    );


    dot.addEventListener(
      'click',
      () => {

        showSlide(
          index,
          true
        );

      }
    );


    dotsContainer
      ?.appendChild(dot);

  }
);


// Mostrar slide
function showSlide(
  index,
  restart = false
) {

  if (!slides.length) {
    return;
  }


  activeSlide =

    (
      index +
      slides.length
    )

    %

    slides.length;


  slides.forEach(
    (slide, i) => {

      slide.classList.toggle(
        'active',
        i === activeSlide
      );

    }
  );


  $$('#heroDots button')
    .forEach(
      (dot, i) => {

        dot.classList.toggle(
          'active',
          i === activeSlide
        );

      }
    );


  if (restart) {

    startHeroAuto();

  }

}


// Cambio automático
function startHeroAuto() {

  clearInterval(
    heroTimer
  );


  if (
    slides.length <= 1
  ) {

    return;

  }


  heroTimer =
    setInterval(
      () => {

        showSlide(
          activeSlide + 1
        );

      },

      6000
    );

}


// Flecha izquierda
$('#heroPrev')
  ?.addEventListener(
    'click',
    () => {

      showSlide(
        activeSlide - 1,
        true
      );

    }
  );


// Flecha derecha
$('#heroNext')
  ?.addEventListener(
    'click',
    () => {

      showSlide(
        activeSlide + 1,
        true
      );

    }
  );


showSlide(0);

startHeroAuto();


// ============================================================
// CATÁLOGO
// ============================================================

const productGrid =
  $('#productGrid');


const searchInput =
  $('#productSearch');


const priceFilter =
  $('#priceFilter');


const emptyState =
  $('#emptyState');


const pagination =
  $('#pagination');


// Categoría seleccionada
let selectedCategory =
  'Todos';


// Página actual
let currentPage = 1;


// ============================================================
// PRODUCTOS POR PÁGINA
// ============================================================
//
// PC:
// 4 productos por fila.
// 8 productos = 2 filas.
//
// Cuando agregues más productos:
// producto 9 → página 2
// producto 17 → página 3
// producto 25 → página 4
//
// ============================================================

const PRODUCTS_PER_PAGE = 8;


// ============================================================
// CREAR TARJETA
// ============================================================

function productCard(product) {

  const oldPrice =

    product.oldPrice

      ? `
          <span class="old-price">
            ${money(product.oldPrice)}
          </span>
        `

      : '';


  const badge =

    product.badge

      ? `
          <span class="product-badge">
            ${product.badge}
          </span>
        `

      : '';


  return `

    <article class="product-card">

      <div class="product-image">

        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        />

        ${badge}

      </div>


      <div class="product-info">

        <span class="product-category">
          ${product.category}
        </span>


        <h3 class="product-title">
          ${product.name}
        </h3>


        <div class="product-prices">

          ${oldPrice}

          <span class="product-price">
            ${money(product.price)}
          </span>

        </div>


        <button
          class="product-button"
          type="button"
          data-product-id="${product.id}"
        >
          VER / PEDIR POR WHATSAPP
        </button>

      </div>

    </article>

  `;

}


// ============================================================
// FILTRO DE PRECIO
// ============================================================

function matchesPrice(
  product
) {

  const selectedPrice =
    priceFilter?.value ||
    'all';


  const price =
    Number(product.price);


  // Todos
  if (
    selectedPrice === 'all'
  ) {

    return true;

  }


  // S/ 15 - S/ 30
  if (
    selectedPrice === '15-30'
  ) {

    return (
      price >= 15 &&
      price <= 30
    );

  }


  // S/ 31 - S/ 50
  if (
    selectedPrice === '31-50'
  ) {

    return (
      price > 30 &&
      price <= 50
    );

  }


  // S/ 51 - S/ 80
  if (
    selectedPrice === '51-80'
  ) {

    return (
      price > 50 &&
      price <= 80
    );

  }


  // S/ 81 - S/ 100
  if (
    selectedPrice === '81-100'
  ) {

    return (
      price > 80 &&
      price <= 100
    );

  }


  // S/ 100 a más
  if (
    selectedPrice === '100+'
  ) {

    return (
      price > 100
    );

  }


  return true;

}


// ============================================================
// OBTENER PRODUCTOS FILTRADOS
// ============================================================
//
// Aquí se combinan:
//
// 1. Categoría
// 2. Buscador
// 3. Precio
//
// EJEMPLO:
//
// Poleras
// +
// S/ 51 - S/ 80
// +
// "blanca"
//
// ============================================================

function getFilteredProducts() {

  const term =

    searchInput
      ?.value
      .trim()
      .toLowerCase()

    || '';


  return PRODUCTS.filter(
    product => {


      // CATEGORÍA
      const matchesCategory =

        selectedCategory ===
        'Todos'

        ||

        product.category ===
        selectedCategory;


      // BUSCADOR
      const haystack = `

        ${product.name}

        ${product.category}

        ${product.description}

      `.toLowerCase();


      const matchesSearch =

        haystack.includes(
          term
        );


      // PRECIO
      const matchesBudget =

        matchesPrice(
          product
        );


      return (

        matchesCategory

        &&

        matchesSearch

        &&

        matchesBudget

      );

    }
  );

}


// ============================================================
// MOSTRAR PRODUCTOS
// ============================================================

function renderProducts() {

  if (!productGrid) {
    return;
  }


  // Productos según filtros
  const filtered =
    getFilteredProducts();


  // Cantidad de páginas
  const totalPages =

    Math.max(

      1,

      Math.ceil(

        filtered.length /

        PRODUCTS_PER_PAGE

      )

    );


  // Evita página inexistente
  if (
    currentPage >
    totalPages
  ) {

    currentPage =
      totalPages;

  }


  // Producto inicial
  const start =

    (
      currentPage - 1
    )

    *

    PRODUCTS_PER_PAGE;


  // Producto final
  const end =

    start +

    PRODUCTS_PER_PAGE;


  // Productos visibles
  const productsToShow =

    filtered.slice(
      start,
      end
    );


  // Pintar tarjetas
  productGrid.innerHTML =

    productsToShow

      .map(
        productCard
      )

      .join('');


  // Sin resultados
  if (emptyState) {

    emptyState.hidden =

      filtered.length > 0;

  }


  // Botones producto
  $$(
    '[data-product-id]',
    productGrid
  ).forEach(
    button => {

      button.addEventListener(
        'click',
        () => {

          openProduct(

            Number(
              button.dataset.productId
            )

          );

        }
      );

    }
  );


  // Dibujar páginas
  renderPagination(
    filtered.length,
    totalPages
  );

}


// ============================================================
// PAGINACIÓN
// ============================================================
//
// IMPORTANTE:
// La paginación se recalcula dependiendo del filtro.
//
// EJEMPLO:
//
// TODOS:
// 24 productos
// 1 2 3
//
// POLOS:
// 17 productos
// 1 2 3
//
// POLERAS:
// 12 productos
// 1 2
//
// OVERSIZE:
// 5 productos
// 1
//
// ============================================================

function renderPagination(
  totalProducts,
  totalPages
) {

  if (!pagination) {
    return;
  }


  // Limpiar botones anteriores
  pagination.innerHTML =
    '';


  // Si no hay productos
  if (
    totalProducts === 0
  ) {

    pagination.hidden =
      true;

    return;

  }


  // Mostrar siempre que haya productos
  pagination.hidden =
    false;


  // ==========================================================
  // BOTÓN ANTERIOR
  // ==========================================================

  const prevButton =
    document.createElement(
      'button'
    );


  prevButton.type =
    'button';


  prevButton.textContent =
    '← ANTERIOR';


  // Desactivar si estamos en página 1
  prevButton.disabled =
    currentPage === 1;


  prevButton.addEventListener(
    'click',
    () => {

      if (
        currentPage <= 1
      ) {

        return;

      }


      currentPage--;


      renderProducts();


      scrollToCatalog();

    }
  );


  pagination.appendChild(
    prevButton
  );


  // ==========================================================
  // FUNCIÓN PARA CREAR NÚMERO
  // ==========================================================

  function createPageButton(
    page
  ) {

    const pageButton =
      document.createElement(
        'button'
      );


    pageButton.type =
      'button';


    pageButton.textContent =
      page;


    pageButton.setAttribute(
      'aria-label',
      `Ir a la página ${page}`
    );


    // Marcar página actual
    if (
      page ===
      currentPage
    ) {

      pageButton.classList.add(
        'active'
      );


      pageButton.setAttribute(
        'aria-current',
        'page'
      );

    }


    pageButton.addEventListener(
      'click',
      () => {

        if (
          page ===
          currentPage
        ) {

          return;

        }


        currentPage =
          page;


        renderProducts();


        scrollToCatalog();

      }
    );


    pagination.appendChild(
      pageButton
    );

  }


  // ==========================================================
  // POCAS PÁGINAS
  // ==========================================================
  //
  // 1 2 3 4 5 6 7
  //
  // ==========================================================

  if (
    totalPages <= 7
  ) {

    for (
      let page = 1;

      page <= totalPages;

      page++
    ) {

      createPageButton(
        page
      );

    }

  }


  // ==========================================================
  // MUCHAS PÁGINAS
  // ==========================================================
  //
  // Ejemplo:
  //
  // 1 ... 4 5 6 ... 20
  //
  // ==========================================================

  else {


    // Primera página
    createPageButton(1);


    // Puntos izquierda
    if (
      currentPage > 4
    ) {

      const dotsLeft =
        document.createElement(
          'span'
        );


      dotsLeft.className =
        'pagination-dots';


      dotsLeft.textContent =
        '...';


      pagination.appendChild(
        dotsLeft
      );

    }


    // Página inicial
    const startPage =

      Math.max(

        2,

        currentPage - 1

      );


    // Página final
    const endPage =

      Math.min(

        totalPages - 1,

        currentPage + 1

      );


    // Páginas del centro
    for (
      let page = startPage;

      page <= endPage;

      page++
    ) {

      createPageButton(
        page
      );

    }


    // Puntos derecha
    if (
      currentPage <
      totalPages - 3
    ) {

      const dotsRight =
        document.createElement(
          'span'
        );


      dotsRight.className =
        'pagination-dots';


      dotsRight.textContent =
        '...';


      pagination.appendChild(
        dotsRight
      );

    }


    // Última página
    createPageButton(
      totalPages
    );

  }


  // ==========================================================
  // BOTÓN SIGUIENTE
  // ==========================================================

  const nextButton =
    document.createElement(
      'button'
    );


  nextButton.type =
    'button';


  nextButton.textContent =
    'SIGUIENTE →';


  // Desactivar en última página
  nextButton.disabled =

    currentPage ===
    totalPages;


  nextButton.addEventListener(
    'click',
    () => {

      if (
        currentPage >=
        totalPages
      ) {

        return;

      }


      currentPage++;


      renderProducts();


      scrollToCatalog();

    }
  );


  pagination.appendChild(
    nextButton
  );

}


// ============================================================
// VOLVER AL INICIO DEL CATÁLOGO
// ============================================================

function scrollToCatalog() {

  const catalog =
    $('#tienda');


  if (!catalog) {
    return;
  }


  const navbarHeight =

    $('.navbar')
      ?.offsetHeight

    || 0;


  const top =

    catalog
      .getBoundingClientRect()
      .top

    +

    window.scrollY

    -

    navbarHeight

    -

    15;


  window.scrollTo({

    top,

    behavior: 'smooth'

  });

}


// ============================================================
// FILTRO POR CATEGORÍA
// ============================================================
//
// TODOS
// POLOS
// OVERSIZE
// POLERAS
//
// Cada categoría tiene su propia paginación.
// ============================================================

$$(
  '#categoryFilters .filter'
).forEach(
  button => {

    button.addEventListener(
      'click',
      () => {


        // Quitar botón activo
        $$(
          '#categoryFilters .filter'
        ).forEach(
          item => {

            item.classList.remove(
              'active'
            );

          }
        );


        // Activar seleccionado
        button.classList.add(
          'active'
        );


        // Guardar categoría
        selectedCategory =
          button.dataset.category;


        // Siempre regresar página 1
        currentPage = 1;


        // Actualizar productos
        renderProducts();

      }
    );

  }
);


// ============================================================
// BUSCADOR
// ============================================================

searchInput
  ?.addEventListener(
    'input',
    () => {

      // Volver a página 1
      currentPage = 1;


      // Recalcular páginas
      renderProducts();

    }
  );


// ============================================================
// FILTRO DE PRESUPUESTO
// ============================================================

priceFilter
  ?.addEventListener(
    'change',
    () => {

      // Volver página 1
      currentPage = 1;


      // Recalcular
      renderProducts();

    }
  );


// Primera carga
renderProducts();


// ============================================================
// MODAL PRODUCTO
// ============================================================

const modal =
  $('#productModal');


const modalImage =
  $('#modalProductImage');


const modalCategory =
  $('#modalProductCategory');


const modalName =
  $('#modalProductName');


const modalDescription =
  $('#modalProductDescription');


const modalPrice =
  $('#modalProductPrice');


const modalOldPrice =
  $('#modalOldPrice');


const sizeSelect =
  $('#sizeSelect');


const quantityInput =
  $('#quantityInput');


const buyWhatsapp =
  $('#buyWhatsapp');


let currentProduct =
  null;


// ============================================================
// ABRIR PRODUCTO
// ============================================================

function openProduct(id) {

  currentProduct =

    PRODUCTS.find(
      product =>
        product.id === id
    );


  if (
    !currentProduct ||
    !modal
  ) {

    return;

  }


  // Imagen
  modalImage.src =
    currentProduct.image;


  modalImage.alt =
    currentProduct.name;


  // Categoría
  modalCategory.textContent =
    currentProduct.category;


  // Nombre
  modalName.textContent =
    currentProduct.name;


  // Descripción
  modalDescription.textContent =
    currentProduct.description;


  // Precio
  modalPrice.textContent =
    money(
      currentProduct.price
    );


  // Precio anterior
  modalOldPrice.textContent =

    currentProduct.oldPrice

      ? money(
          currentProduct.oldPrice
        )

      : '';


  modalOldPrice.style.display =

    currentProduct.oldPrice

      ? ''

      : 'none';


  // Tallas
  sizeSelect.innerHTML =

    '<option value="">Selecciona una talla</option>'

    +

    currentProduct.sizes

      .map(
        size =>
          `<option value="${size}">${size}</option>`
      )

      .join('');


  // Cantidad
  quantityInput.value =
    1;


  // Mostrar modal
  modal.classList.add(
    'open'
  );


  modal.setAttribute(
    'aria-hidden',
    'false'
  );


  document.body.classList.add(
    'modal-open'
  );

}


// ============================================================
// CERRAR MODAL
// ============================================================

function closeModal() {

  if (!modal) {
    return;
  }


  modal.classList.remove(
    'open'
  );


  modal.setAttribute(
    'aria-hidden',
    'true'
  );


  document.body.classList.remove(
    'modal-open'
  );


  currentProduct =
    null;

}


// Botones cerrar
$$(
  '[data-close-modal]'
).forEach(
  element => {

    element.addEventListener(
      'click',
      closeModal
    );

  }
);


// Escape
document.addEventListener(
  'keydown',
  event => {

    if (

      event.key ===
      'Escape'

      &&

      modal
        ?.classList
        .contains('open')

    ) {

      closeModal();

    }

  }
);


// ============================================================
// CANTIDAD
// ============================================================

function normalizeQty() {

  const value =

    Math.min(

      20,

      Math.max(

        1,

        Number.parseInt(
          quantityInput.value,
          10
        )

        ||

        1

      )

    );


  quantityInput.value =
    value;


  return value;

}


// Restar
$('#qtyMinus')
  ?.addEventListener(
    'click',
    () => {

      quantityInput.value =

        Math.max(

          1,

          normalizeQty() - 1

        );

    }
  );


// Sumar
$('#qtyPlus')
  ?.addEventListener(
    'click',
    () => {

      quantityInput.value =

        Math.min(

          20,

          normalizeQty() + 1

        );

    }
  );


// Validar
quantityInput
  ?.addEventListener(
    'change',
    normalizeQty
  );


// ============================================================
// PEDIDO POR WHATSAPP
// ============================================================

buyWhatsapp
  ?.addEventListener(
    'click',
    () => {

      if (
        !currentProduct
      ) {

        return;

      }


      // Talla
      const size =
        sizeSelect.value;


      if (!size) {

        sizeSelect.focus();


        alert(
          'Selecciona una talla para continuar.'
        );


        return;

      }


      // Cantidad
      const quantity =
        normalizeQty();


      // Total
      const total =

        currentProduct.price

        *

        quantity;


      // Mensaje
      const message =

        `Hola, quiero realizar un pedido en JONZKO.\n\n`

        +

        `Producto: ${currentProduct.name}\n`

        +

        `Talla: ${size}\n`

        +

        `Cantidad: ${quantity}\n`

        +

        `Precio: ${money(currentProduct.price)}\n`

        +

        `Total: ${money(total)}\n\n`

        +

        `¿Me confirman disponibilidad y cómo coordinamos la entrega?`;


      // Abrir WhatsApp
      window.open(

        waUrl(message),

        '_blank',

        'noopener'

      );

    }
  );


// ============================================================
// AÑO DEL FOOTER
// ============================================================

const year =
  $('#year');


if (year) {

  year.textContent =
    new Date()
      .getFullYear();

}