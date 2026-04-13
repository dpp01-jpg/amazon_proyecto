const registerForm = document.getElementById('registerForm');
const errorMsg = document.getElementById('errorMsg');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const passwordConfirm = document.getElementById('passwordConfirm').value.trim();

        errorMsg.textContent = ''; // Limpiar errores

        // Validaciones JS Custom
        if (password.length < 6) {
            errorMsg.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            return;
        }

        if (password !== passwordConfirm) {
            errorMsg.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Cuenta creada con éxito. Ahora puedes iniciar sesión.');
                window.location.href = 'login.html'; // Redirigir a login
            } else {
                errorMsg.textContent = data.error || 'Error en el registro.';
            }
        } catch (err) {
            errorMsg.textContent = 'Error de conexión con el servidor.';
        }
    });
}
