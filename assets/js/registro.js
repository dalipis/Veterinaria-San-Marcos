// Espera a que el HTML esté disponible antes de buscar sus elementos.
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.querySelector('#current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const form = document.querySelector('#registro-form');
    const formMessage = document.querySelector('#form-message');

    if (!form || !formMessage) return;

    // Clave donde se guardan TODOS los usuarios registrados (un array de objetos).
    // login.html va a leer de esta misma clave para validar las credenciales.
    const USUARIOS_KEY = 'vsm_usuarios';
    const EDAD_MINIMA = 14;
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

    // Calcula la edad exacta a partir de la fecha de nacimiento, considerando
    // si ya pasó el cumpleaños este año (no basta con restar los años).
    const calcularEdad = (fechaNacimientoStr) => {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimientoStr);

        if (Number.isNaN(nacimiento.getTime())) {
            return 0;
        }

        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const noHaCumplidoAnos =
            hoy.getMonth() < nacimiento.getMonth() ||
            (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());

        if (noHaCumplidoAnos) edad -= 1;
        return edad;
    };

    // Mínimo 8 caracteres, al menos 1 mayúscula y 1 número.
    const passwordValida = (password) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

    // Limpia todos los mensajes de error de un envío anterior.
    const limpiarErrores = () => {
        document.querySelectorAll('.field-error').forEach((span) => (span.textContent = ''));
        formMessage.textContent = '';
        formMessage.style.color = '';
    };

    const mostrarError = (idCampo, mensaje) => {
        const span = document.querySelector(`#error-${idCampo}`);
        
        if (span) span.textContent = mensaje,span.style.color = 'var(--color-coral)';

    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        limpiarErrores();

        const datos = {
            nombre: form.nombre.value.trim(),
            apellido: form.apellido.value.trim(),
            fechaNacimiento: form.fechaNacimiento.value,
            correo: normalizarCorreo(form.correo.value),
            password: form.password.value,
            confirmarPassword: form.confirmarPassword.value,
            direccion: form.direccion.value.trim(),
            region: form.region.value,
            genero: form.genero.value,
            aceptaCondiciones: form.aceptaCondiciones.checked,
        };

        let esValido = true;
        const marcarError = (campo, mensaje) => {
            mostrarError(campo, mensaje);
            
            esValido = false;
        };

        // --- Campos obligatorios ---
        if (!datos.nombre) marcarError('nombre', 'Ingresa tu nombre.');
        if (!datos.apellido) marcarError('apellido', 'Ingresa tu apellido.');
        if (!datos.direccion) marcarError('direccion', 'Ingresa tu dirección.');
        if (!datos.region) marcarError('region', 'Selecciona una región.');
        if (!datos.genero) marcarError('genero', 'Selecciona una opción.');
        if (!datos.aceptaCondiciones) marcarError('acepta-condiciones', 'Debes aceptar las condiciones para continuar.');

        // --- Fecha de nacimiento + edad mínima ---
        if (!datos.fechaNacimiento) {
            marcarError('fecha-nacimiento', 'Ingresa tu fecha de nacimiento.');
        } else if (calcularEdad(datos.fechaNacimiento) < EDAD_MINIMA) {
            marcarError('fecha-nacimiento', `Debes tener al menos ${EDAD_MINIMA} años para registrarte.`);
        }

        // --- Correo: formato + dominio institucional + no duplicado ---
        if (!datos.correo) {
            marcarError('correo', 'Ingresa tu correo electrónico.');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
            marcarError('correo', 'El correo no tiene un formato válido.');
        } else if (!datos.correo.endsWith(DOMINIO_PERMITIDO)) {
            marcarError('correo', `Solo se aceptan correos del dominio ${DOMINIO_PERMITIDO}.`);
        } else if (obtenerUsuarios().some((usuario) => normalizarCorreo(usuario.correo) === datos.correo)) {
            marcarError('correo', 'Ya existe una cuenta registrada con este correo.');
        }

        // --- Contraseña: formato + coincidencia ---
        if (!datos.password) {
            marcarError('password', 'Ingresa una contraseña.');
        } else if (!passwordValida(datos.password)) {
            marcarError('password', 'Debe tener 8+ caracteres, con 1 mayúscula y 1 número.');
        }

        if (!datos.confirmarPassword) {
            marcarError('confirmar-password', 'Confirma tu contraseña.');
        } else if (datos.password && datos.confirmarPassword !== datos.password) {
            formMessage.style.color = 'var(--color-coral)';
            marcarError('confirmar-password', 'Las contraseñas no coinciden.');
        }

        if (!esValido) {
            formMessage.style.color = 'var(--color-coral)';
            formMessage.textContent = '¡No se pudo crear la cuenta! Revisa los campos obligatorios(*).';
            return;
        }

        // --- Guardar usuario ---
        // Nota: en un backend real la contraseña se guardaría con hash (ej. bcrypt),
        // nunca en texto plano. Como este proyecto es solo frontend con localStorage,
        // no existe ese paso — es una limitación conocida del prototipo, no un descuido.
        const usuarios = obtenerUsuarios();
        usuarios.push({
            nombre: datos.nombre,
            apellido: datos.apellido,
            fechaNacimiento: datos.fechaNacimiento,
            correo: datos.correo,
            password: datos.password,
            direccion: datos.direccion,
            region: datos.region,
            genero: datos.genero,
            compras: [],
            intentosFallidos: 0,
            bloqueado: false,
        });
        guardarUsuarios(usuarios);

        formMessage.style.color = 'var(--color-logo-dark)';
        formMessage.textContent = '¡Cuenta creada con éxito! Ya puedes iniciar sesión.';
        form.reset();
    });
});
