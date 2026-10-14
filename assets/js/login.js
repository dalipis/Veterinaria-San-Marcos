document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.querySelector('#current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const form = document.querySelector('#login-form');
    const formMessage = document.querySelector('#form-message');

    if (!form || !formMessage) return;

    const USUARIOS_KEY = 'vsm_usuarios';
    const USUARIO_LOGUEADO_KEY = 'vsm_usuario_logueado';
    const MAX_INTENTOS = 3;
    const DOMINIO_PERMITIDO = '@duoc.cl';

    const normalizarCorreo = (valor) => String(valor || '').trim().toLowerCase();

    const obtenerUsuarios = () => {
        try {
            const usuarios = JSON.parse(localStorage.getItem(USUARIOS_KEY));
            return Array.isArray(usuarios) ? usuarios : [];
        } catch {
            return [];
        }
    };

    const guardarUsuarios = (usuarios) => {
        localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    };

    // Limpia todos los mensajes de error de un envío anterior.
    const limpiarErrores = () => {
        document.querySelectorAll('.field-error').forEach((span) => (span.textContent = ''));
        formMessage.textContent = '';
        formMessage.style.color = '';
    };

    const mostrarError = (idCampo, mensaje) => {
        const span = document.querySelector(`#error-${idCampo}`);
        if (span) span.textContent = mensaje;
    };

    // Si ya hay una sesión activa, se redirige al inicio para evitar entrar de nuevo.
    if (localStorage.getItem(USUARIO_LOGUEADO_KEY)) {
        window.location.href = 'index.html';
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        limpiarErrores();

        const correo = normalizarCorreo(form.correo.value);
        const password = form.password.value;

        let esValido = true;

        // --- Validación del correo institucional ---
        if (!correo) {
            mostrarError('correo', 'Ingresa tu correo electrónico.');
            esValido = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || !correo.endsWith(DOMINIO_PERMITIDO)) {
            mostrarError('correo', 'Usa un correo institucional válido con dominio @duoc.cl.');
            esValido = false;
        }

        // --- Validación de la contraseña ---
        if (!password) {
            mostrarError('password', 'Ingresa tu contraseña.');
            esValido = false;
        }

        if (!esValido) {
            formMessage.style.color = 'var(--color-coral)';
            formMessage.textContent = 'Revisa los datos ingresados.';
            return;
        }

        const usuarios = obtenerUsuarios();
        const usuario = usuarios.find((u) => normalizarCorreo(u.correo) === correo);

        // Si no existe una cuenta con ese correo, se informa al usuario.
        if (!usuario) {
            mostrarError('correo', 'No existe una cuenta registrada con este correo.');
            formMessage.style.color = 'var(--color-coral)';
            formMessage.textContent = 'No existe una cuenta registrada con este correo.';
            return;
        }

        // Verificar si la cuenta ya está bloqueada
        if (usuario.bloqueado) {
            formMessage.style.color = 'var(--color-coral)';
            formMessage.textContent = 'Tu cuenta está bloqueada por superar el límite de 3 intentos fallidos.';
            return;
        }

        // Validar credenciales
        if (usuario.password === password) {
            // Éxito: resetear contador de intentos
            usuario.intentosFallidos = 0;
            usuario.bloqueado = false;
            guardarUsuarios(usuarios);

            // Guardar nombre y apellido del usuario en la sesión activa
            localStorage.setItem(USUARIO_LOGUEADO_KEY, JSON.stringify({
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
            }));

            formMessage.style.color = 'var(--color-logo-dark)';
            formMessage.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            return;
        }

        // Intento fallido
        usuario.intentosFallidos = (usuario.intentosFallidos || 0) + 1;

        if (usuario.intentosFallidos >= MAX_INTENTOS) {
            usuario.bloqueado = true;
            guardarUsuarios(usuarios);
            formMessage.style.color = 'var(--color-coral)';
            formMessage.textContent = `Has alcanzado ${MAX_INTENTOS} intentos fallidos. Tu cuenta ha sido bloqueada.`;
            return;
        }

        guardarUsuarios(usuarios);
        const restantes = MAX_INTENTOS - usuario.intentosFallidos;
        mostrarError('password', `Contraseña incorrecta. Te quedan ${restantes} intentos.`);
        formMessage.style.color = 'var(--color-coral)';
        formMessage.textContent = 'Credenciales incorrectas.';
    });
});
