// Diccionario de traducciones
const translations = {
    es: {
        nav_send_to: "Enviar a",
        nav_country: "España",
        nav_search_placeholder: "Buscar en Amazon.es",
        nav_hello: "Hola, identifícate",
        nav_account: "Cuenta y listas ▾",
        nav_returns: "Devoluciones",
        nav_orders: "y Pedidos",
        nav_cart: "Carrito",
        btn_login: "Identifícate"
    },
    en: {
        nav_send_to: "Deliver to",
        nav_country: "Spain",
        nav_search_placeholder: "Search Amazon",
        nav_hello: "Hello, sign in",
        nav_account: "Account & Lists ▾",
        nav_returns: "Returns",
        nav_orders: "& Orders",
        nav_cart: "Cart",
        btn_login: "Sign in"
    },
    pt: {
        nav_send_to: "Enviar para",
        nav_country: "Espanha",
        nav_search_placeholder: "Pesquisar na Amazon",
        nav_hello: "Olá, faça seu login",
        nav_account: "Contas e Listas ▾",
        nav_returns: "Devoluções",
        nav_orders: "e Pedidos",
        nav_cart: "Carrinho",
        btn_login: "Fazer login"
    }
};

// Función principal para cambiar el idioma
function changeLanguage(lang) {
    // Guardar el idioma elegido
    localStorage.setItem('app_lang', lang);

    // Actualizar el botón del idioma visualmente
    const dropbtn = document.querySelector('.dropbtn');
    if(dropbtn) {
        if(lang === 'es') dropbtn.textContent = '🇪🇸 ES ▾';
        if(lang === 'en') dropbtn.textContent = '🇬🇧 EN ▾';
        if(lang === 'pt') dropbtn.textContent = '🇵🇹 PT ▾';
    }

    // Buscar todos los elementos que tengan el atributo data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            // Si es el placeholder del buscador
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = translations[lang][key];
            } else {
                // Caso especial para el saludo del usuario
                if (key === 'nav_hello') {
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        try {
                            const user = JSON.parse(savedUser);
                            if (user && user.nombre) {
                                const prefixes = { es: 'Hola, ', en: 'Hello, ', pt: 'Olá, ' };
                                el.textContent = (prefixes[lang] || 'Hola, ') + user.nombre;
                                return;
                            }
                        } catch (e) {
                            console.error("Error al parsear usuario en i18n:", e);
                        }
                    }
                }
                // Para textos normales
                el.innerHTML = translations[lang][key];
            }
        }
    });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Leer el idioma guardado o usar 'es' por defecto
    const savedLang = localStorage.getItem('app_lang') || 'es';
    changeLanguage(savedLang);
});
