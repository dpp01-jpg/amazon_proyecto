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
            const res = await fetch('http://192.168.12.27:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });

            const data = await res.json();
            if (res.ok) {
                // En lugar de alert, mostramos un mensaje bonito en la misma página
                registerForm.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: #007185;">¡Casi listo!</h2>
                        <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
                            Hemos enviado un enlace de verificación a <strong>${email}</strong>.
                        </p>
                        <p style="font-size: 13px; color: #111;">
                            Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar tu cuenta.
                        </p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <a href="login.html" style="color: #0066c0; text-decoration: none; font-size: 13px;">Volver al inicio de sesión</a>
                    </div>
                `;
            } else {
                errorMsg.textContent = data.error || 'Error en el registro.';
            }
        } catch (err) {
            errorMsg.textContent = 'Error de conexión con el servidor.';
        }
    });
}
