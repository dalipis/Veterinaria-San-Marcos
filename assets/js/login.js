document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.querySelector('#current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const form = document.querySelector('#login-form');
    const formMessage = document.querySelector('#form-message');

    const USUARIOS_KEY = 'vsm_usuarios';
    const USUARIO_LOGUEADO_KEY = 'vsm_usuario_logueado';
    const MAX_INTENTOS = 3;

    const obtenerUsuarios = () => {
        try {
            return JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
        } catch {
            return [];
        }
    };

    const guardarUsuarios = (usuarios) => {
        localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    };

    const limpiarErrores = () => {
        document.querySelectorAll('.field-error').forEach((span) => (span.textContent = ''));
        if (formMessage) formMessage.textContent = '';
    };

    const mostrarError = (idCampo, mensaje) => {
        const span = document.querySelector(`#error-${idCampo}`);
        if (span) span.textContent = mensaje;
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        limpiarErrores();

        const correo = form.correo.value.trim().toLowerCase();
        const password = form.password.value;

        let esValido = true;
        if (!correo) {
            mostrarError('correo', 'Ingresa tu correo electrónico.');
            esValido = false;
        }
        if (!password) {
            mostrarError('password', 'Ingresa tu contraseña.');
            esValido = false;
        }

        if (!esValido) return;

        const usuarios = obtenerUsuarios();
        const usuarioIndex = usuarios.findIndex((u) => u.correo === correo);

        if (usuarioIndex === -1) {
            mostrarError('correo', 'No existe una cuenta registrada con este correo.');
            return;
        }

        const usuario = usuarios[usuarioIndex];

        // Verificar si la cuenta ya está bloqueada
        if (usuario.bloqueado) {
            formMessage.style.color = 'var(--color-coral)';
            formMessage.textContent = 'Tu cuenta se encuentra bloqueada por superar el límite de 3 intentos fallidos.';
            return;
        }

        // Validar credenciales
        if (usuario.password === password) {
            // Éxito: resetear contador de intentos
            usuario.intentosFallidos = 0;
            guardarUsuarios(usuarios);

            // Guardar nombre y apellido del usuario en la sesión activa
            localStorage.setItem(USUARIO_LOGUEADO_KEY, JSON.stringify({
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo
            }));

            formMessage.style.color = 'var(--color-logo-dark)';
            formMessage.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // Intento fallido
            usuario.intentosFallidos = (usuario.intentosFallidos || 0) + 1;

            if (usuario.intentosFallidos >= MAX_INTENTOS) {
                usuario.bloqueado = true;
                guardarUsuarios(usuarios);
                formMessage.style.color = 'var(--color-coral)';
                formMessage.textContent = `Has alcanzado ${MAX_INTENTOS} intentos fallidos. Tu cuenta ha sido bloqueada.`;
            } else {
                guardarUsuarios(usuarios);
                const restantes = MAX_INTENTOS - usuario.intentosFallidos;
                mostrarError('password', `Contraseña incorrecta. Intentos restantes: ${restantes}`);
            }
        }
    });
});