// Lógica del menú desplegable "Mi cuenta" del header.
// Este archivo se incluye en TODAS las páginas (index, registro, login...)
// para no repetir el mismo código de abrir/cerrar en cada una.
document.addEventListener('DOMContentLoaded', () => {
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
});
