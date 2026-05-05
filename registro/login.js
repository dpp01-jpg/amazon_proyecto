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
                
                // Si el error es de verificación (403), añadimos un botón para reenviar el correo
                if (res.status === 403 && data.error.includes('verifica')) {
                    const resendBtn = document.createElement('button');
                    resendBtn.textContent = 'Reenviar enlace de verificación';
                    resendBtn.style.marginTop = '10px';
                    resendBtn.style.backgroundColor = '#f3f3f3';
                    resendBtn.style.color = '#111';
                    resendBtn.style.border = '1px solid #ccc';
                    resendBtn.style.padding = '5px 10px';
                    resendBtn.style.cursor = 'pointer';
                    resendBtn.type = 'button';
                    resendBtn.onclick = async () => {
                        resendBtn.textContent = 'Enviando...';
                        try {
                            const reRes = await fetch('http://localhost:3000/api/resend-verification', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email })
                            });
                            const reData = await reRes.json();
                            alert(reData.message || 'Enlace enviado.');
                            resendBtn.textContent = 'Reenviar enlace (Enviado ✓)';
                        } catch(e) {
                            alert('Error de conexión al reenviar el correo.');
                        }
                    };
                    errorMsg.appendChild(document.createElement('br'));
                    errorMsg.appendChild(resendBtn);
                }
            }
        } catch (err) {
            errorMsg.textContent = 'Error de conexión con el servidor.';
        }
    });
}
