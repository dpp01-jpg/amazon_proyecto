const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('usuario').value.trim();
        const password = document.getElementById('password').value.trim();

        errorMsg.textContent = ''; // Limpiar errores

        if (!email || !password) {
            errorMsg.textContent = 'Por favor, rellena todos los campos.';
            return;
        }

        // Validación JS pura del email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorMsg.textContent = 'Formato de correo electrónico inválido.';
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Login correcto. Redirigiendo...');
                window.location.href = '../index.html'; // Volver al inicio tras login
            } else {
                errorMsg.textContent = data.error || 'Autenticación fallida.';
            }
        } catch (err) {
            errorMsg.textContent = 'Error de conexión con el servidor.';
        }
    });
}
