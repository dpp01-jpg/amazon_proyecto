document.addEventListener('DOMContentLoaded', () => {
    const navList = document.getElementById('dynamic-categories');
    const todoBtn = document.getElementById('cat-todo');

    if (!navList) return;

    // Fetch categories from the backend
    fetchCategories();

    // Event listener for "Todo"
    if (todoBtn) {
        todoBtn.addEventListener('click', () => {
            if (window.filterByCategory) {
                window.filterByCategory(null);
            }
        });
    }

    async function fetchCategories() {
        try {
            const response = await fetch('http://192.168.12.27:3000/api/categories');
            if (!response.ok) throw new Error("Fallo al conectar con la API de categorías");
            const categories = await response.json();

            renderCategories(categories);
        } catch (err) {
            console.error("Error cargando categorías:", err);
        }
    }

    function renderCategories(categories) {
        // We keep the "Todo" button and append the others
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.className = 'nav-hover';
            li.textContent = cat.nombre;
            li.style.cursor = 'pointer';
            
            li.addEventListener('click', () => {
                // Navegar a la página de categoría
                window.location.href = `./categoria/category.html?id=${cat.id}`;
            });

            navList.appendChild(li);
        });
    }
});
