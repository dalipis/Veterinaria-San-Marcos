// Lógica del menú desplegable "Mi cuenta" del header.
// Este archivo se incluye en TODAS las páginas (index, registro, login...)
// para no repetir el mismo código de abrir/cerrar en cada una.
document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();
    const paginasSinFooter = ['login.html', 'registro.html'];

    // Primero elimina cualquier footer existente en login y registro.
    const existentes = document.querySelectorAll('footer.site-footer');
    existentes.forEach((pie) => pie.remove());

    // No se dibuja el footer compartido en login ni registro.
    if (!paginasSinFooter.includes(page)) {
        // Unifica el footer en todas las páginas del sitio, menos login y registro.
        const footer = document.createElement('footer');
        footer.className = 'site-footer';
        footer.innerHTML = `
            <div class="container">
                <div class="footer-main">
                    <div class="footer-brand-block">
                        <a class="footer-brand" href="index.html#inicio">
                            <img class="brand-logo" src="Imagenes/Logo%20veterinaria.png" alt="">
                            <span>Veterinaria <strong>San Marcos</strong></span>
                        </a>
                        <p>Cuidado cercano para quienes hacen de tu casa un hogar.</p>
                    </div>
                    <div class="footer-column">
                        <h3>Explora</h3>
                        <a href="index.html#inicio">Inicio</a>
                        <a href="catalogo.html">Catálogo</a>
                        <a href="index.html#especialistas">Especialistas</a>
                        <a href="index.html#nosotros">Quiénes somos</a>
                    </div>
                    <div class="footer-column">
                        <h3>Conversemos</h3>
                        <p>Estamos en Rancagua, Región de O'Higgins.</p>
                        <a class="footer-action" href="index.html#contacto">Agendar consulta <span aria-hidden="true">→</span></a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>Equipo: Dalí Morales | Joaquín Diez | Marco Palma</p>
                    <p>DSY1104 · <span id="current-year"></span></p>
                </div>
            </div>
        `;

        document.body.appendChild(footer);

        const year = footer.querySelector('#current-year');
        if (year) year.textContent = new Date().getFullYear();
    }

    const toggle = document.querySelector('#account-toggle');
    const dropdown = document.querySelector('#account-dropdown');

    // Si una página no tiene este menú, no hacemos nada (evita errores en consola).
    if (!toggle || !dropdown) return;

    const cerrarMenu = () => {
        dropdown.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', (event) => {
        // Evita que este mismo clic llegue al listener de "click afuera" de abajo
        // y cierre el menú en el mismo instante en que lo abrimos.
        event.stopPropagation();

        const estaAbierto = !dropdown.hidden;
        dropdown.hidden = estaAbierto;
        toggle.setAttribute('aria-expanded', String(!estaAbierto));
    });

    // Cierra el menú si se hace clic en cualquier otra parte de la página.
    document.addEventListener('click', (event) => {
        const clicFueraDelMenu = !dropdown.hidden && !dropdown.contains(event.target) && event.target !== toggle;
        if (clicFueraDelMenu) cerrarMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') cerrarMenu();
    });

    // Hamburger Menu para móvil y tablet
    const navToggle = document.querySelector('#nav-toggle');
    const mobileNav = document.querySelector('#mobile-nav');

    if (navToggle && mobileNav) {
        const abrirCerrarMenu = () => {
            const estaAbierto = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!estaAbierto));
            
            if (!estaAbierto) {
                mobileNav.setAttribute('data-mobile-open', 'true');
            } else {
                mobileNav.removeAttribute('data-mobile-open');
            }
        };

        navToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            abrirCerrarMenu();
        });

        // Cierra el menú al hacer clic en un enlace
        const navLinks = mobileNav.querySelectorAll('a');
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                mobileNav.removeAttribute('data-mobile-open');
            });
        });

        // Cierra el menú si se hace clic fuera
        document.addEventListener('click', (event) => {
            const menuEstaAbierto = navToggle.getAttribute('aria-expanded') === 'true';
            const clicEnNavToggle = navToggle.contains(event.target);
            const clicEnNav = mobileNav.contains(event.target);

            if (menuEstaAbierto && !clicEnNavToggle && !clicEnNav) {
                navToggle.setAttribute('aria-expanded', 'false');
                mobileNav.removeAttribute('data-mobile-open');
            }
        });

        // Cierra el menú con la tecla Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                navToggle.setAttribute('aria-expanded', 'false');
                mobileNav.removeAttribute('data-mobile-open');
            }
        });
    }
});
