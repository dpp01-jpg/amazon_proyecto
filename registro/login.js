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
            const res = await fetch('http://192.168.12.27:3000/api/login', {
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
                    // Evitar duplicados
                    if (!document.getElementById('resendBtn')) {
                        const resendBtn = document.createElement('button');
                        resendBtn.id = 'resendBtn';
                        resendBtn.textContent = 'Reenviar enlace de verificación';
                        resendBtn.style.marginTop = '10px';
                        resendBtn.style.backgroundColor = '#f3f3f3';
                        resendBtn.style.color = '#111';
                        resendBtn.style.border = '1px solid #ccc';
                        resendBtn.style.padding = '8px 12px';
                        resendBtn.style.cursor = 'pointer';
                        resendBtn.style.borderRadius = '3px';
                        resendBtn.style.width = '100%';
                        resendBtn.type = 'button';
                        resendBtn.onclick = async () => {
                            resendBtn.textContent = 'Enviando...';
                            resendBtn.disabled = true;
                            try {
                                const reRes = await fetch('http://192.168.12.27:3000/api/resend-verification', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email })
                                });
                                const reData = await reRes.json();
                                alert(reData.message || 'Enlace enviado.');
                                resendBtn.textContent = 'Enlace reenviado ✓';
                            } catch(e) {
                                alert('Error de conexión al reenviar el correo.');
                                resendBtn.textContent = 'Reenviar enlace de verificación';
                                resendBtn.disabled = false;
                            }
                        };
                        errorMsg.appendChild(document.createElement('br'));
                        errorMsg.appendChild(resendBtn);
                    }
                }
            }
        } catch (err) {
            errorMsg.textContent = 'Error de conexión con el servidor.';
        }
    });
}
