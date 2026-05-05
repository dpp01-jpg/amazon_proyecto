// legal-cookies.js
document.addEventListener("DOMContentLoaded", function() {
    // Check if consent is already given
    if (!localStorage.getItem('cookieConsent')) {
        showCookieBanner();
    }
});

function showCookieBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #232f3e;
        color: white;
        padding: 15px 20px;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-sizing: border-box;
    `;

    // Try to figure out relative path for links based on current URL
    const isSubdir = window.location.pathname.includes('/producto/') || window.location.pathname.includes('/categoria/') || window.location.pathname.includes('/carrito/') || window.location.pathname.includes('/registro/');
    const basePath = isSubdir ? '../' : './';

    banner.innerHTML = `
        <div style="max-width: 1200px; width: 100%; display: flex; flex-direction: column; gap: 10px; text-align: center;">
            <p style="margin: 0; line-height: 1.5;">
                <strong>Aviso de Cookies:</strong> Utilizamos cookies propias y de terceros para mejorar nuestros servicios, personalizar y analizar su navegación, y mostrarle publicidad relacionada con sus preferencias. Si continúa navegando, consideramos que acepta su uso. Puede obtener más información, o bien conocer cómo cambiar la configuración, en nuestra 
                <a href="${basePath}legales/politica-cookies.html" style="color: #f3a847; text-decoration: underline;">Política de Cookies</a>.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button id="btn-accept-cookies" style="background-color: #f3a847; color: #111; border: 1px solid #a88734; padding: 8px 15px; border-radius: 3px; cursor: pointer; font-weight: bold;">Aceptar todas</button>
                <button id="btn-reject-cookies" style="background-color: #eaeded; color: #111; border: 1px solid #a6a6a6; padding: 8px 15px; border-radius: 3px; cursor: pointer;">Rechazar no esenciales</button>
            </div>
        </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('btn-accept-cookies').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.style.display = 'none';
        // Initialize non-essential scripts here if any
    });

    document.getElementById('btn-reject-cookies').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'rejected');
        banner.style.display = 'none';
    });
}
