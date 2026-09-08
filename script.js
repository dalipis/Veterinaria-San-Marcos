document.addEventListener('DOMContentLoaded', () => {

    const currentYear = document.querySelector('#current-year');
    if (currentYear) currentYear.textContent = new Date().getFullYear();

    // ===================================================================
    // 1. SESIÓN DE USUARIO, MENÚ Y HISTORIAL "MIS COMPRAS"
    // ===================================================================
    const userDisplay = document.querySelector('#user-display');
    const linkLogin = document.querySelector('#link-login');
    const linkRegistro = document.querySelector('#link-registro');
    const linkCompras = document.querySelector('#link-compras');
    const linkLogout = document.querySelector('#link-logout');

    const ordersOverlay = document.querySelector('#orders-overlay');
    const ordersClose = document.querySelector('#orders-close');
    const ordersContainer = document.querySelector('#orders-container');

    const USUARIOS_KEY = 'vsm_usuarios';
    const USUARIO_LOGUEADO_KEY = 'vsm_usuario_logueado';
    const PRODUCTOS_KEY = 'vsm_productos';
    const CARRITO_KEY = 'vsm_carrito';

    const usuarioLogueado = JSON.parse(localStorage.getItem(USUARIO_LOGUEADO_KEY));

    if (usuarioLogueado && userDisplay) {
        const nombreCompleto = `${usuarioLogueado.nombre} ${usuarioLogueado.apellido}`.trim();
        userDisplay.textContent = nombreCompleto;

        if (linkLogin) linkLogin.hidden = true;
        if (linkRegistro) linkRegistro.hidden = true;
        if (linkCompras) linkCompras.hidden = false;
        if (linkLogout) linkLogout.hidden = false;
    }

    if (linkLogout) {
        linkLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem(USUARIO_LOGUEADO_KEY);
            window.location.href = 'index.html';
        });
    }

    const renderHistorialCompras = () => {
        if (!usuarioLogueado || !ordersContainer) return;

        const usuarios = JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
        const usuarioActual = usuarios.find(u => u.correo === usuarioLogueado.correo);
        const compras = (usuarioActual && usuarioActual.compras) ? usuarioActual.compras : [];

        if (compras.length === 0) {
            ordersContainer.innerHTML = '<p style="color: var(--color-muted); text-align: center; padding: 20px 0;">Aún no has realizado ninguna compra con tu cuenta.</p>';
            return;
        }

        ordersContainer.innerHTML = compras.map(orden => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Orden #${orden.idOrden}</span>
                    <span class="order-date">${orden.fecha}</span>
                </div>
                <ul class="order-items-list">
                    ${orden.items.map(item => `
                        <li class="order-item-row">
                            <span>${item.cantidad}x ${item.nombre}</span>
                            <span>$${item.subtotal.toLocaleString('es-CL')}</span>
                        </li>
                    `).join('')}
                </ul>
                <div class="order-total-row">
                    <span>Total Pagado:</span>
                    <strong>$${orden.total.toLocaleString('es-CL')}</strong>
                </div>
            </div>
        `).join('');
    };

    if (linkCompras) {
        linkCompras.addEventListener('click', (e) => {
            e.preventDefault();
            renderHistorialCompras();
            if (ordersOverlay) ordersOverlay.hidden = false;
        });
    }

    if (ordersClose) {
        ordersClose.addEventListener('click', () => {
            if (ordersOverlay) ordersOverlay.hidden = true;
        });
    }

    if (ordersOverlay) {
        ordersOverlay.addEventListener('click', (e) => {
            if (e.target === ordersOverlay) ordersOverlay.hidden = true;
        });
    }

    // ===================================================================
    // 2. FORMULARIO DE CONTACTO
    // ===================================================================
    const contactForm = document.querySelector('#contact-form');
    const formMessage = document.querySelector('#form-message');

    if (contactForm) {
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
    }

    // ===================================================================
    // 3. PERSISTENCIA E INICIALIZACIÓN DE PRODUCTOS
    // ===================================================================
    const PRODUCTOS_INICIALES = [
        { id: 'ME001', categoria: 'Antibióticos', nombre: 'Amoxibay 250mg', principioActivo: 'Amoxicilina', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 45, precio: 4200, icono: '💊' },
        { id: 'ME002', categoria: 'Antibióticos', nombre: 'Enrox 50mg', principioActivo: 'Enrofloxacino', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 30, precio: 6800, icono: '💊' },
        { id: 'ME004', categoria: 'Antiparasitarios', nombre: 'Nexgard', principioActivo: 'Afoxolaner', presentacion: 'Masticable 1 unid.', especie: 'Perro', stock: 60, precio: 9500, icono: '🐛' },
        { id: 'ME005', categoria: 'Antiparasitarios', nombre: 'Bravecto', principioActivo: 'Fluralaner', presentacion: 'Masticable 1 unid.', especie: 'Perro', stock: 40, precio: 18900, icono: '🐛' },
        { id: 'ME006', categoria: 'Antiparasitarios', nombre: 'Revolution Plus', principioActivo: 'Selamectina + Sarolaner', presentacion: 'Pipeta 1 unid.', especie: 'Gato', stock: 35, precio: 14500, icono: '🐛' },
        { id: 'ME009', categoria: 'Antiinflamatorios', nombre: 'Meloxicam 1mg', principioActivo: 'Meloxicam', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 55, precio: 4500, icono: '🩹' },
        { id: 'ME011', categoria: 'Dermatología', nombre: 'Clorhexidina shampoo', principioActivo: 'Clorhexidina 2%', presentacion: 'Frasco 250ml', especie: 'Perro / Gato', stock: 25, precio: 8900, icono: '🧴' },
        { id: 'ME013', categoria: 'Dermatología', nombre: 'Apoquel 16mg', principioActivo: 'Oclacitinib', presentacion: 'Blíster 10 comp.', especie: 'Perro', stock: 18, precio: 22000, icono: '🧴' },
        { id: 'ME014', categoria: 'Digestivo', nombre: 'Probifor', principioActivo: 'Bacillus clausii', presentacion: 'Sobre 5ml x10', especie: 'Perro / Gato', stock: 40, precio: 5600, icono: '🍽️' },
        { id: 'ME016', categoria: 'Cardíaco', nombre: 'Vetmedin 2.5mg', principioActivo: 'Pimobendan', presentacion: 'Blíster 10 comp.', especie: 'Perro', stock: 15, precio: 28000, icono: '❤️' },
        { id: 'ME018', categoria: 'Vacunas', nombre: 'Nobivac DHPPi', principioActivo: 'Vacuna polivalente', presentacion: 'Vial 1 dosis', especie: 'Perro', stock: 48, precio: 8500, icono: '💉' },
        { id: 'ME021', categoria: 'Suplementos', nombre: 'Omega vet 3-6-9', principioActivo: 'Ácidos grasos omega', presentacion: 'Frasco 100ml', especie: 'Perro / Gato', stock: 30, precio: 9900, icono: '🌿' }
    ];

    const obtenerProductos = () => {
        let prods = localStorage.getItem(PRODUCTOS_KEY);
        if (!prods) {
            localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(PRODUCTOS_INICIALES));
            return PRODUCTOS_INICIALES;
        }
        return JSON.parse(prods);
    };

    const guardarProductos = (prods) => {
        localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(prods));
    };

    const obtenerCarrito = () => {
        try {
            return JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
        } catch {
            return [];
        }
    };

    const guardarCarrito = (carrito) => {
        localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    };

    const formatearPrecio = (numero) => `$${numero.toLocaleString('es-CL')}`;
    const buscarProducto = (id) => obtenerProductos().find((p) => p.id === id);

    const cantidadEnCarrito = (id) => {
        const item = obtenerCarrito().find((item) => item.id === id);
        return item ? item.cantidad : 0;
    };

    const stockDisponible = (producto) => producto.stock - cantidadEnCarrito(producto.id);

    // ===================================================================
    // 4. RENDER DESTACADOS EN HERO
    // ===================================================================
    const renderHeroFeatured = () => {
        const heroGrid = document.querySelector('#hero-featured-grid');
        if (!heroGrid) return;

        const productos = obtenerProductos();
        const destacados = [productos[2], productos[3], productos[7]];

        heroGrid.innerHTML = destacados.map(p => `
            <article class="service-card" style="background: white; color: var(--color-ink);">
                <div class="service-icon">${p.icono}</div>
                <p class="service-category">${p.categoria}</p>
                <h3>${p.nombre}</h3>
                <p>${p.principioActivo}</p>
                <div class="service-details">
                    <span>${p.especie}</span>
                    <strong>${formatearPrecio(p.precio)}</strong>
                </div>
            </article>
        `).join('');
    };

    // ===================================================================
    // 5. RENDER Y FILTROS DEL CATÁLOGO
    // ===================================================================
    const productsGrid = document.querySelector('#products-grid');
    const filterCategoria = document.querySelector('#filter-categoria');
    const filterPrecio = document.querySelector('#filter-precio');
    const priceValue = document.querySelector('#price-value');

    const renderProductos = () => {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';

        const productos = obtenerProductos();
        const catSel = filterCategoria ? filterCategoria.value : 'TODAS';
        const precMax = filterPrecio ? parseInt(filterPrecio.value) : 30000;

        const filtrados = productos.filter(p => {
            const cumpleCat = (catSel === 'TODAS' || p.categoria === catSel);
            const cumplePrec = (p.precio <= precMax);
            return cumpleCat && cumplePrec;
        });

        if (filtrados.length === 0) {
            productsGrid.innerHTML = '<p style="grid-column: 1/-1; color: var(--color-muted);">No se encontraron productos con los filtros seleccionados.</p>';
            return;
        }

        filtrados.forEach((producto) => {
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

    if (filterCategoria) filterCategoria.addEventListener('change', renderProductos);
    if (filterPrecio) {
        filterPrecio.addEventListener('input', () => {
            priceValue.textContent = formatearPrecio(parseInt(filterPrecio.value));
            renderProductos();
        });
    }

    // ===================================================================
    // 6. MODAL DETALLE DE PRODUCTO
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

    const actualizarDetalle = () => {
        if (!productoAbierto) return;
        const disponible = stockDisponible(productoAbierto);
        const sinStock = disponible <= 0;

        detailIcon.textContent = productoAbierto.icono;
        detailCategoria.textContent = productoAbierto.categoria;
        detailTitle.textContent = productoAbierto.nombre;
        detailDescripcion.textContent = `${productoAbierto.principioActivo} — presentación: ${productoAbierto.presentacion}.`;
        detailEspecie.textContent = productoAbierto.especie;
        detailPrecio.textContent = formatearPrecio(productoAbierto.precio);
        detailStock.textContent = sinStock ? 'No quedan unidades disponibles.' : `Disponible: ${disponible} unidades.`;
        detailStock.classList.toggle('detail-stock--low', sinStock);

        detailAdd.disabled = sinStock;
        detailAdd.textContent = sinStock ? 'Sin stock' : 'Agregar al carrito';
    };

    const cerrarDetalle = () => {
        if (detailOverlay) detailOverlay.hidden = true;
        productoAbierto = null;
    };

    if (detailClose) detailClose.addEventListener('click', cerrarDetalle);
    if (detailOverlay) {
        detailOverlay.addEventListener('click', (e) => {
            if (e.target === detailOverlay) cerrarDetalle();
        });
    }

    if (productsGrid) {
        productsGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.product-detail-btn');
            if (btn) abrirDetalle(btn.dataset.id);
        });
    }

    // ===================================================================
    // 7. CARRITO Y CHECKOUT CON VINCULACIÓN A LA CUENTA
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
    const cartCheckout = document.querySelector('#cart-checkout');
    const cartCount = document.querySelector('#cart-count');

    const agregarAlCarrito = (id) => {
        const producto = buscarProducto(id);
        if (!producto || stockDisponible(producto) <= 0) return;

        const carrito = obtenerCarrito();
        const item = carrito.find((i) => i.id === id);

        if (item) {
            item.cantidad += 1;
        } else {
            carrito.push({ id, cantidad: 1 });
        }

        guardarCarrito(carrito);
        renderProductos();
        actualizarDetalle();
        renderCarrito();
    };

    if (detailAdd) {
        detailAdd.addEventListener('click', () => {
            if (productoAbierto) agregarAlCarrito(productoAbierto.id);
        });
    }

    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            cartPanel.hidden = false;
            cartOverlay.hidden = false;
        });
    }

    const cerrarCarrito = () => {
        if (cartPanel) cartPanel.hidden = true;
        if (cartOverlay) cartOverlay.hidden = true;
    };

    if (cartClose) cartClose.addEventListener('click', cerrarCarrito);
    if (cartOverlay) cartOverlay.addEventListener('click', cerrarCarrito);

    const cambiarCantidad = (id, delta) => {
        const carrito = obtenerCarrito();
        const item = carrito.find((i) => i.id === id);
        if (!item) return;

        const producto = buscarProducto(id);
        const nuevaCant = item.cantidad + delta;

        if (delta > 0 && nuevaCant > producto.stock) {
            alert(`No hay suficiente stock disponible. Máximo: ${producto.stock}`);
            return;
        }

        if (nuevaCant <= 0) {
            quitarDelCarrito(id);
            return;
        }

        item.cantidad = nuevaCant;
        guardarCarrito(carrito);
        renderProductos();
        actualizarDetalle();
        renderCarrito();
    };

    const quitarDelCarrito = (id) => {
        const carrito = obtenerCarrito().filter((i) => i.id !== id);
        guardarCarrito(carrito);
        renderProductos();
        actualizarDetalle();
        renderCarrito();
    };

    if (cartClear) {
        cartClear.addEventListener('click', () => {
            guardarCarrito([]);
            renderProductos();
            actualizarDetalle();
            renderCarrito();
        });
    }

    if (cartCheckout) {
        cartCheckout.addEventListener('click', () => {
            const carrito = obtenerCarrito();
            if (carrito.length === 0) return;

            const usuarioSesion = JSON.parse(localStorage.getItem(USUARIO_LOGUEADO_KEY));
            if (!usuarioSesion) {
                alert('Debes iniciar sesión con tu cuenta para realizar la compra.');
                window.location.href = 'login.html';
                return;
            }

            const productos = obtenerProductos();
            let totalCompra = 0;
            const detalleItems = [];

            for (let item of carrito) {
                const prod = productos.find(p => p.id === item.id);
                if (!prod || prod.stock < item.cantidad) {
                    alert(`Stock insuficiente para el producto: ${prod ? prod.nombre : 'Desconocido'}.`);
                    return;
                }
                const subtotal = prod.precio * item.cantidad;
                totalCompra += subtotal;
                prod.stock -= item.cantidad;

                detalleItems.push({
                    id: prod.id,
                    nombre: prod.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: prod.precio,
                    subtotal: subtotal
                });
            }

            const nuevaOrden = {
                idOrden: 'ORD-' + Date.now(),
                fecha: new Date().toLocaleString('es-CL'),
                items: detalleItems,
                total: totalCompra
            };

            const usuarios = JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
            const usuarioIndex = usuarios.findIndex(u => u.correo === usuarioSesion.correo);

            if (usuarioIndex !== -1) {
                if (!usuarios[usuarioIndex].compras) {
                    usuarios[usuarioIndex].compras = [];
                }
                usuarios[usuarioIndex].compras.push(nuevaOrden);
                localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
            }

            guardarProductos(productos);
            guardarCarrito([]);

            alert(`¡Compra realizada con éxito, ${usuarioSesion.nombre}! El pedido #${nuevaOrden.idOrden} ha quedado registrado en tu cuenta.`);
            cerrarCarrito();
            renderProductos();
            renderHeroFeatured();
            renderCarrito();
        });
    }

    if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (!id) return;

            if (e.target.matches('[data-action="sumar"]')) cambiarCantidad(id, 1);
            if (e.target.matches('[data-action="restar"]')) cambiarCantidad(id, -1);
            if (e.target.matches('[data-action="quitar"]')) quitarDelCarrito(id);
        });
    }

    const renderCarrito = () => {
        if (!cartCount) return;
        const carrito = obtenerCarrito();
        const totalItems = carrito.reduce((suma, i) => suma + i.cantidad, 0);
        cartCount.textContent = totalItems;

        if (carrito.length === 0) {
            if (cartItemsList) cartItemsList.innerHTML = '';
            if (cartEmpty) cartEmpty.hidden = false;
            if (cartFooter) cartFooter.hidden = true;
            return;
        }

        if (cartEmpty) cartEmpty.hidden = true;
        if (cartFooter) cartFooter.hidden = false;

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
                        <button class="qty-btn" type="button" data-action="restar" data-id="${producto.id}">−</button>
                        <span>${item.cantidad}</span>
                        <button class="qty-btn" type="button" data-action="sumar" data-id="${producto.id}">+</button>
                        <button class="cart-item-remove" type="button" data-action="quitar" data-id="${producto.id}">Quitar</button>
                    </div>
                </li>
            `;
        }).join('');

        if (cartTotal) cartTotal.textContent = formatearPrecio(total);
    };

    renderHeroFeatured();
    renderProductos();
    renderCarrito();
});