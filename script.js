// Espera a que el HTML esté disponible antes de buscar sus elementos.
document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // 1. FORMULARIO DE CONTACTO (ya existía, sin cambios)
    // ===================================================================
    const contactForm = document.querySelector('#contact-form');
    const formMessage = document.querySelector('#form-message');
    const currentYear = document.querySelector('#current-year');

    currentYear.textContent = new Date().getFullYear();

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!contactForm.checkValidity()) {
            formMessage.textContent = 'Por favor, completa todos los campos solicitados.';
            contactForm.reportValidity();
            return;
        }

        formMessage.textContent = 'Gracias por escribirnos. Te contactaremos pronto.';
        contactForm.reset();
    });

    // ===================================================================
    // 2. CATÁLOGO DE PRODUCTOS (Medicamentos y Vacunas en stock)
    // Datos tomados del archivo "Catálogo Veterinaria San Marcos".
    // En un backend real esto vendría de una base de datos; acá lo dejamos
    // fijo en el código y usamos localStorage solo para el carrito.
    // ===================================================================
    const productos = [
        { id: 'ME001', categoria: 'Antibióticos', nombre: 'Amoxibay 250mg', principioActivo: 'Amoxicilina', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 45, precio: 4200, icono: '💊' },
        { id: 'ME002', categoria: 'Antibióticos', nombre: 'Enrox 50mg', principioActivo: 'Enrofloxacino', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 30, precio: 6800, icono: '💊' },
        { id: 'ME003', categoria: 'Antibióticos', nombre: 'Metrobay 250mg', principioActivo: 'Metronidazol', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 28, precio: 3900, icono: '💊' },
        { id: 'ME004', categoria: 'Antiparasitarios', nombre: 'Nexgard', principioActivo: 'Afoxolaner', presentacion: 'Masticable 1 unid.', especie: 'Perro', stock: 60, precio: 9500, icono: '🐛' },
        { id: 'ME005', categoria: 'Antiparasitarios', nombre: 'Bravecto', principioActivo: 'Fluralaner', presentacion: 'Masticable 1 unid.', especie: 'Perro', stock: 40, precio: 18900, icono: '🐛' },
        { id: 'ME006', categoria: 'Antiparasitarios', nombre: 'Revolution Plus', principioActivo: 'Selamectina + Sarolaner', presentacion: 'Pipeta 1 unid.', especie: 'Gato', stock: 35, precio: 14500, icono: '🐛' },
        { id: 'ME007', categoria: 'Antiparasitarios', nombre: 'Drontal Plus', principioActivo: 'Praziquantel + Pamoato', presentacion: 'Comprimido 1 unid.', especie: 'Perro', stock: 80, precio: 3200, icono: '🐛' },
        { id: 'ME008', categoria: 'Antiparasitarios', nombre: 'Milbemax Gato', principioActivo: 'Milbemicina + Praziquantel', presentacion: 'Comprimido 2 unid.', especie: 'Gato', stock: 50, precio: 6800, icono: '🐛' },
        { id: 'ME009', categoria: 'Antiinflamatorios', nombre: 'Meloxicam 1mg', principioActivo: 'Meloxicam', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 55, precio: 4500, icono: '🩹' },
        { id: 'ME010', categoria: 'Antiinflamatorios', nombre: 'Carprofen 50mg', principioActivo: 'Carprofeno', presentacion: 'Blíster 10 comp.', especie: 'Perro', stock: 30, precio: 9800, icono: '🩹' },
        { id: 'ME011', categoria: 'Dermatología', nombre: 'Clorhexidina shampoo', principioActivo: 'Clorhexidina 2%', presentacion: 'Frasco 250ml', especie: 'Perro / Gato', stock: 25, precio: 8900, icono: '🧴' },
        { id: 'ME012', categoria: 'Dermatología', nombre: 'Malaseb shampoo', principioActivo: 'Miconazol + Clorhexidina', presentacion: 'Frasco 250ml', especie: 'Perro / Gato', stock: 20, precio: 12500, icono: '🧴' },
        { id: 'ME013', categoria: 'Dermatología', nombre: 'Apoquel 16mg', principioActivo: 'Oclacitinib', presentacion: 'Blíster 10 comp.', especie: 'Perro', stock: 18, precio: 22000, icono: '🧴' },
        { id: 'ME014', categoria: 'Digestivo', nombre: 'Probifor', principioActivo: 'Bacillus clausii', presentacion: 'Sobre 5ml x10', especie: 'Perro / Gato', stock: 40, precio: 5600, icono: '🍽️' },
        { id: 'ME015', categoria: 'Digestivo', nombre: 'Omeprazol 10mg vet', principioActivo: 'Omeprazol', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 35, precio: 3800, icono: '🍽️' },
        { id: 'ME016', categoria: 'Cardíaco', nombre: 'Vetmedin 2.5mg', principioActivo: 'Pimobendan', presentacion: 'Blíster 10 comp.', especie: 'Perro', stock: 15, precio: 28000, icono: '❤️' },
        { id: 'ME017', categoria: 'Analgésicos', nombre: 'Tramadol 50mg vet', principioActivo: 'Tramadol', presentacion: 'Blíster 10 comp.', especie: 'Perro', stock: 22, precio: 5200, icono: '🌡️' },
        { id: 'ME018', categoria: 'Vacunas', nombre: 'Nobivac DHPPi', principioActivo: 'Vacuna polivalente', presentacion: 'Vial 1 dosis', especie: 'Perro', stock: 48, precio: 8500, icono: '💉' },
        { id: 'ME019', categoria: 'Vacunas', nombre: 'Nobivac Rabies', principioActivo: 'Vacuna antirrábica', presentacion: 'Vial 1 dosis', especie: 'Perro / Gato', stock: 60, precio: 5800, icono: '💉' },
        { id: 'ME020', categoria: 'Vacunas', nombre: 'Felocell CVR', principioActivo: 'Vacuna triple felina', presentacion: 'Vial 1 dosis', especie: 'Gato', stock: 36, precio: 7200, icono: '💉' },
        { id: 'ME021', categoria: 'Suplementos', nombre: 'Omega vet 3-6-9', principioActivo: 'Ácidos grasos omega', presentacion: 'Frasco 100ml', especie: 'Perro / Gato', stock: 30, precio: 9900, icono: '🌿' },
        { id: 'ME022', categoria: 'Suplementos', nombre: 'Condrovet forte', principioActivo: 'Condroitín + Glucosamina', presentacion: 'Blíster 30 comp.', especie: 'Perro', stock: 25, precio: 14500, icono: '🌿' },
    ];

    // Formatea números como precio chileno, ej: 4200 -> "$4.200".
    const formatearPrecio = (numero) => `$${numero.toLocaleString('es-CL')}`;

    // ===================================================================
    // 3. CARRITO EN localStorage
    // Guardamos solo { id, cantidad } por ítem; el resto de los datos
    // (nombre, precio, stock) siempre se leen desde el arreglo "productos"
    // de arriba, así nunca quedan desincronizados.
    // ===================================================================
    const CARRITO_KEY = 'vsm_carrito';

    const obtenerCarrito = () => {
        try {
            return JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
        } catch {
            // Si el localStorage tiene datos corruptos, partimos de un carrito vacío.
            return [];
        }
    };

    const guardarCarrito = (carrito) => {
        localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    };

    const buscarProducto = (id) => productos.find((producto) => producto.id === id);

    const cantidadEnCarrito = (id) => {
        const item = obtenerCarrito().find((item) => item.id === id);
        return item ? item.cantidad : 0;
    };

    // Stock "disponible para comprar" = stock total - lo que el usuario ya tiene en el carrito.
    // Esto es lo que evita que alguien agregue más unidades de las que existen.
    const stockDisponible = (producto) => producto.stock - cantidadEnCarrito(producto.id);

    // ===================================================================
    // 4. RENDER DEL CATÁLOGO (tarjetas de producto)
    // ===================================================================
    const productsGrid = document.querySelector('#products-grid');

    const renderProductos = () => {
        productsGrid.innerHTML = '';

        productos.forEach((producto) => {
            const disponible = stockDisponible(producto);
            const sinStock = disponible <= 0;

            const card = document.createElement('article');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-icon" aria-hidden="true">${producto.icono}</div>
                <p class="service-category">${producto.categoria}</p>
                <h3>${producto.nombre}</h3>
                <p class="product-especie">${producto.especie}</p>
                <div class="product-footer">
                    <span class="product-price">${formatearPrecio(producto.precio)}</span>
                </div>
                <p class="product-stock ${sinStock ? 'product-stock--low' : ''}">
                    ${sinStock ? 'Sin stock disponible' : `Disponible: ${disponible} unidades`}
                </p>
                <button class="product-detail-btn" type="button" data-id="${producto.id}">Ver detalle</button>
            `;
            productsGrid.appendChild(card);
        });
    };

    // ===================================================================
    // 5. MODAL DE DETALLE DE PRODUCTO
    // ===================================================================
    const detailOverlay = document.querySelector('#detail-overlay');
    const detailIcon = document.querySelector('#detail-icon');
    const detailCategoria = document.querySelector('#detail-categoria');
    const detailTitle = document.querySelector('#detail-title');
    const detailDescripcion = document.querySelector('#detail-descripcion');
    const detailEspecie = document.querySelector('#detail-especie');
    const detailPrecio = document.querySelector('#detail-precio');
    const detailStock = document.querySelector('#detail-stock');
    const detailAdd = document.querySelector('#detail-add');
    const detailClose = document.querySelector('#detail-close');

    let productoAbierto = null;

    const abrirDetalle = (id) => {
        const producto = buscarProducto(id);
        if (!producto) return;

        productoAbierto = producto;
        actualizarDetalle();
        detailOverlay.hidden = false;
    };

    // Se llama al abrir el modal y también cada vez que cambia el stock disponible,
    // para que el botón "Agregar" y el texto de stock reflejen siempre lo último.
    const actualizarDetalle = () => {
        if (!productoAbierto) return;
        const disponible = stockDisponible(productoAbierto);
        const sinStock = disponible <= 0;

        detailIcon.textContent = productoAbierto.icono;
        detailCategoria.textContent = productoAbierto.categoria;
        detailTitle.textContent = productoAbierto.nombre;
        detailDescripcion.textContent =
            `${productoAbierto.principioActivo} — presentación: ${productoAbierto.presentacion}.`;
        detailEspecie.textContent = productoAbierto.especie;
        detailPrecio.textContent = formatearPrecio(productoAbierto.precio);
        detailStock.textContent = sinStock
            ? 'No quedan unidades disponibles.'
            : `Disponible: ${disponible} unidades.`;
        detailStock.classList.toggle('detail-stock--low', sinStock);

        detailAdd.disabled = sinStock;
        detailAdd.textContent = sinStock ? 'Sin stock' : 'Agregar al carrito';
    };

    const cerrarDetalle = () => {
        detailOverlay.hidden = true;
        productoAbierto = null;
    };

    detailClose.addEventListener('click', cerrarDetalle);
    detailOverlay.addEventListener('click', (event) => {
        // Cierra solo si el clic fue en el fondo oscuro, no dentro de la tarjeta del modal.
        if (event.target === detailOverlay) cerrarDetalle();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') cerrarDetalle();
    });

    // Delegación de eventos: un solo listener para todos los botones "Ver detalle",
    // aunque las tarjetas se re-generen dinámicamente.
    productsGrid.addEventListener('click', (event) => {
        const boton = event.target.closest('.product-detail-btn');
        if (boton) abrirDetalle(boton.dataset.id);
    });

    // ===================================================================
    // 6. AGREGAR AL CARRITO (con control de stock)
    // ===================================================================
    const agregarAlCarrito = (id) => {
        const producto = buscarProducto(id);
        if (!producto || stockDisponible(producto) <= 0) return; // seguridad extra, no debería llegar acá

        const carrito = obtenerCarrito();
        const item = carrito.find((item) => item.id === id);

        if (item) {
            item.cantidad += 1;
        } else {
            carrito.push({ id, cantidad: 1 });
        }

        guardarCarrito(carrito);
        renderProductos();     // el stock disponible en las tarjetas puede haber cambiado
        actualizarDetalle();   // y también en el modal, si sigue abierto
        renderCarrito();
    };

    detailAdd.addEventListener('click', () => {
        if (productoAbierto) agregarAlCarrito(productoAbierto.id);
    });

    // ===================================================================
    // 7. PANEL DEL CARRITO
    // ===================================================================
    const cartToggle = document.querySelector('#cart-toggle');
    const cartPanel = document.querySelector('#carrito');
    const cartOverlay = document.querySelector('#cart-overlay');
    const cartClose = document.querySelector('#cart-close');
    const cartItemsList = document.querySelector('#cart-items');
    const cartEmpty = document.querySelector('#cart-empty');
    const cartFooter = document.querySelector('#cart-footer');
    const cartTotal = document.querySelector('#cart-total');
    const cartClear = document.querySelector('#cart-clear');
    const cartCount = document.querySelector('#cart-count');

    const abrirCarrito = () => {
        cartPanel.hidden = false;
        cartOverlay.hidden = false;
        cartToggle.setAttribute('aria-expanded', 'true');
    };

    const cerrarCarrito = () => {
        cartPanel.hidden = true;
        cartOverlay.hidden = true;
        cartToggle.setAttribute('aria-expanded', 'false');
    };

    cartToggle.addEventListener('click', abrirCarrito);
    cartClose.addEventListener('click', cerrarCarrito);
    cartOverlay.addEventListener('click', cerrarCarrito);

    const cambiarCantidad = (id, delta) => {
        const carrito = obtenerCarrito();
        const item = carrito.find((item) => item.id === id);
        if (!item) return;

        const producto = buscarProducto(id);
        const nuevaCantidad = item.cantidad + delta;

        // Al subir, no dejamos superar el stock total del producto.
        if (delta > 0 && nuevaCantidad > producto.stock) return;

        if (nuevaCantidad <= 0) {
            quitarDelCarrito(id);
            return;
        }

        item.cantidad = nuevaCantidad;
        guardarCarrito(carrito);
        renderProductos();
        actualizarDetalle();
        renderCarrito();
    };

    const quitarDelCarrito = (id) => {
        const carrito = obtenerCarrito().filter((item) => item.id !== id);
        guardarCarrito(carrito);
        renderProductos();
        actualizarDetalle();
        renderCarrito();
    };

    cartClear.addEventListener('click', () => {
        guardarCarrito([]);
        renderProductos();
        actualizarDetalle();
        renderCarrito();
    });

    // Delegación de eventos para los botones +/- y "Quitar" dentro del carrito.
    cartItemsList.addEventListener('click', (event) => {
        const id = event.target.dataset.id;
        if (!id) return;

        if (event.target.matches('[data-action="sumar"]')) cambiarCantidad(id, 1);
        if (event.target.matches('[data-action="restar"]')) cambiarCantidad(id, -1);
        if (event.target.matches('[data-action="quitar"]')) quitarDelCarrito(id);
    });

    const renderCarrito = () => {
        const carrito = obtenerCarrito();
        const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
        cartCount.textContent = totalItems;

        if (carrito.length === 0) {
            cartItemsList.innerHTML = '';
            cartEmpty.hidden = false;
            cartFooter.hidden = true;
            return;
        }

        cartEmpty.hidden = true;
        cartFooter.hidden = false;

        let total = 0;
        cartItemsList.innerHTML = carrito.map((item) => {
            const producto = buscarProducto(item.id);
            const subtotal = producto.precio * item.cantidad;
            total += subtotal;

            return `
                <li class="cart-item">
                    <div class="cart-item-top">
                        <span>${producto.nombre}</span>
                        <span>${formatearPrecio(subtotal)}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" type="button" data-action="restar" data-id="${producto.id}" aria-label="Quitar una unidad">−</button>
                        <span>${item.cantidad}</span>
                        <button class="qty-btn" type="button" data-action="sumar" data-id="${producto.id}" aria-label="Agregar una unidad">+</button>
                        <button class="cart-item-remove" type="button" data-action="quitar" data-id="${producto.id}">Quitar</button>
                    </div>
                </li>
            `;
        }).join('');

        cartTotal.textContent = formatearPrecio(total);
    };

    // ===================================================================
    // Primer render al cargar la página.
    // ===================================================================
    renderProductos();
    renderCarrito();
});