// Espera a que el HTML esté disponible antes de buscar sus elementos.
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('#contact-form');
    const formMessage = document.querySelector('#form-message');
    const currentYear = document.querySelector('#current-year');

    // Muestra automáticamente el año actual en el footer.
    currentYear.textContent = new Date().getFullYear();

    // Valida el formulario y evita el envío mientras no exista backend.
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
});