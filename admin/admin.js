const productForm = document.getElementById('productForm');
const productsTable = document.querySelector('#productsTable tbody');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

// URL base del backend
const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario ya inició sesión previamente en esta ventana
    const hasAccess = sessionStorage.getItem('adminAccess');
    const role = sessionStorage.getItem('adminRole');
    if (hasAccess === 'true') {
        document.getElementById('admin-login-overlay').style.display = 'none';
        fetchProducts();
        fetchBannersAdmin(); // Carga banners para root y staff
        fetchCategoriesAdmin(); // Carga categorías para el grid

        if (role === 'admin') {
            renderUsersAdminPanel();
            fetchUsersAdmin();
        }
    }
    // Si no tiene acceso, el overlay seguirá visible cubriendo la página
});

window.loginAdmin = async () => {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-pwd').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            // Comprobar si tiene rango suficiente
            if (data.user.rol === 'admin' || data.user.rol === 'staff') {
                sessionStorage.setItem('adminAccess', 'true');
                sessionStorage.setItem('adminRole', data.user.rol);
                sessionStorage.setItem('adminEmail', data.user.email);

                document.getElementById('admin-login-overlay').style.display = 'none';
                document.getElementById('admin-error').style.display = 'none';

                fetchProducts();
                fetchBannersAdmin(); // Carga banners al entrar
                fetchCategoriesAdmin(); // Carga categorías al entrar

                if (data.user.rol === 'admin') {
                    renderUsersAdminPanel();
                    fetchUsersAdmin();
                }
            } else {
                document.getElementById('admin-error').style.display = 'block';
                document.getElementById('admin-error').textContent = 'No tienes permisos de Administrador ni Staff.';
            }
        } else {
            // Credenciales erróneas
            document.getElementById('admin-error').style.display = 'block';
            document.getElementById('admin-error').textContent = 'Credenciales inválidas.';
        }
    } catch (err) {
        console.error(err);
        document.getElementById('admin-error').textContent = "Error de conexión con la API";
        document.getElementById('admin-error').style.display = 'block';
    }
};

window.logoutAdmin = () => {
    if (confirm("¿Estás seguro de que quieres cerrar la sesión de administrador?")) {
        sessionStorage.removeItem('adminAccess');
        sessionStorage.removeItem('adminRole');
        sessionStorage.removeItem('adminEmail');
        window.location.reload(); // Recarga para mostrar el overlay de nuevo
    }
};

async function fetchProducts() {
    try {
        // Obtenemos hasta 100 productos para el admin
        const response = await fetch(`${API_URL}/products?limit=100&page=1`);
        const result = await response.json();
        renderTable(result.data);
    } catch (err) {
        console.error('Error fetching products:', err);
    }
}

function renderTable(products) {
    productsTable.innerHTML = '';
    products.forEach(p => {
        const tr = document.createElement('tr');
        const promoInfo = p.promo_percent ? `<br><span style="color:red; font-size:12px;">-${p.promo_percent}% ${p.promo_text || ''}</span>` : '';

        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.title}${promoInfo}</td>
            <td>${p.price} €</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${p.id}, \`${p.title.replace(/'/g, "\\'")}\`, ${p.price}, '${p.image}', \`${p.description ? p.description.replace(/'/g, "\\'") : ''}\`, ${p.id_categoria}, \`${p.detalles ? p.detalles.replace(/\n/g, '\\n').replace(/'/g, "\\'") : ''}\`, ${p.promo_percent || 'null'}, '${p.promo_text || ''}')">Editar</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${p.id})">Eliminar</button>
            </td>
        `;
        productsTable.appendChild(tr);
    });
}

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('productId').value;
    const product = {
        title: document.getElementById('title').value,
        price: document.getElementById('price').value,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value,
        id_categoria: document.getElementById('id_categoria').value,
        detalles: document.getElementById('detalles').value,
        promo_percent: document.getElementById('promo_percent').value || null,
        promo_text: document.getElementById('promo_text').value || null
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            alert(`Producto ${id ? 'actualizado' : 'creado'} con éxito.`);
            resetForm();
            fetchProducts();
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión con el servidor.');
    }
});

window.editProduct = (id, title, price, image, description, id_categoria, detalles, promo_percent, promo_text) => {
    document.getElementById('productId').value = id;
    document.getElementById('title').value = title;
    document.getElementById('price').value = price;
    document.getElementById('image').value = image;
    document.getElementById('description').value = description !== 'null' ? description : '';
    document.getElementById('id_categoria').value = id_categoria;
    document.getElementById('detalles').value = detalles !== 'null' && detalles ? detalles : '';
    document.getElementById('promo_percent').value = promo_percent !== null ? promo_percent : '';
    document.getElementById('promo_text').value = promo_text !== 'null' ? promo_text : '';

    submitBtn.textContent = 'Actualizar Producto';
    cancelBtn.style.display = 'inline-block';
};

window.deleteProduct = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
            alert('Producto eliminado');
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    }
};

function resetForm() {
    productForm.reset();
    document.getElementById('productId').value = '';
    document.getElementById('detalles').value = '';
    submitBtn.textContent = 'Añadir Producto';
    cancelBtn.style.display = 'none';
}

cancelBtn.addEventListener('click', resetForm);

// ==========================================
// FUNCIONES DE CONTROL DE USUARIOS (Solo rol admin)
// ==========================================

function renderUsersAdminPanel() {
    const container = document.getElementById('users-container');
    container.innerHTML = `
        <hr style="margin-bottom: 20px;">
        <h2 style="color: #c40000;">Gestión de Usuarios (Blacklist / Whitelist)</h2>
        <table id="usersTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado de Baneo</th>
                    <th>Acciones Rápidas</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
}

window.fetchUsersAdmin = async () => {
    try {
        const response = await fetch(`${API_URL}/users?adminEmail=${sessionStorage.getItem('adminEmail')}`);
        if (!response.ok) return; // Si da 403 es que no tiene permiso
        const users = await response.json();
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        users.forEach(u => {
            let isBanned = u.ban_until && new Date(u.ban_until) > new Date();
            let statusText = isBanned ? `<span style="color:red;font-weight:bold;">Baneado hasta ${new Date(u.ban_until).toLocaleString()}</span>` : '<span style="color:green;">Activo</span>';

            tbody.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.email}</td>
                    <td>
                        <select onchange="changeRoleAdmin(${u.id}, this.value)">
                            <option value="user" ${u.rol === 'user' ? 'selected' : ''}>Usuario Cliente</option>
                            <option value="staff" ${u.rol === 'staff' ? 'selected' : ''}>Staff (Whitelist)</option>
                            <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>Root</option>
                        </select>
                    </td>
                    <td>${statusText} ${isBanned ? `<br><small>${u.ban_reason}</small>` : ''}</td>
                    <td>
                        <button class="action-btn delete-btn" onclick="promptBan(${u.id})">Añadir Ban</button>
                        ${isBanned ? `<button class="action-btn" style="background:#5cb85c;" onclick="unbanUser(${u.id})">Desbanear</button>` : ''}
                        <button class="action-btn" style="background:#333;" onclick="deleteUserAdmin(${u.id})">Borrar Cuenta</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err);
    }
};

window.changeRoleAdmin = async (id, newRole) => {
    await fetch(`${API_URL}/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: sessionStorage.getItem('adminEmail'), rol: newRole })
    });
    alert('Rol de usuario guardado.');
};

window.promptBan = async (id) => {
    const mins = prompt("¿Cuántos minutos quieres banear al usuario? (ej: 5, 60 para una hora, 1440 para un día)");
    if (!mins || isNaN(mins)) return;
    const reason = prompt("Motivo del baneo (escribe algo):");
    if (!reason) return;

    await fetch(`${API_URL}/users/${id}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: sessionStorage.getItem('adminEmail'), minutes: mins, reason })
    });
    fetchUsersAdmin();
};

window.unbanUser = async (id) => {
    if (confirm("¿Seguro que quieres desbanearle y darle acceso de nuevo?")) {
        await fetch(`${API_URL}/users/${id}/unban`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminEmail: sessionStorage.getItem('adminEmail') })
        });
        fetchUsersAdmin();
    }
};

window.deleteUserAdmin = async (id) => {
    if (confirm("¿ELIMINAR ESTA CUENTA PARA SIEMPRE? No habrá vuelta atrás.")) {
        await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminEmail: sessionStorage.getItem('adminEmail') })
        });
        fetchUsersAdmin();
    }
};

// ========================
// GESTIÓN DE BANNERS (CARRUSEL)
// ========================

async function fetchBannersAdmin() {
    try {
        const response = await fetch(`${API_URL}/carousel`);
        const banners = await response.json();
        const tbody = document.querySelector('#bannersTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        banners.forEach(b => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="../${b.image_url}" style="width:100px; height:50px; object-fit:cover; border:1px solid #ccc;"></td>
                    <td style="font-size:12px;">${b.image_url}<br><strong>${b.alt_text}</strong></td>
                    <td>
                        <button onclick="deleteBannerAdmin(${b.id})" class="action-btn delete-btn">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error cargando banners:", err);
    }
}

// Handler formulario de banners
const bannerForm = document.getElementById('bannerForm');
if (bannerForm) {
    bannerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const image_url = document.getElementById('banner-image').value;
        const alt_text = document.getElementById('banner-alt').value;
        const adminEmail = sessionStorage.getItem('adminEmail');

        const response = await fetch(`${API_URL}/carousel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url, alt_text, adminEmail })
        });

        if (response.ok) {
            bannerForm.reset();
            fetchBannersAdmin();
        } else {
            alert("Error al añadir banner.");
        }
    });
}

window.deleteBannerAdmin = async (id) => {
    if (confirm("¿Seguro que quieres eliminar este banner del carrusel?")) {
        const adminEmail = sessionStorage.getItem('adminEmail');
        await fetch(`${API_URL}/carousel/${id}?adminEmail=${adminEmail}`, {
            method: 'DELETE'
        });
        fetchBannersAdmin();
    }
};

// ========================
// GESTIÓN DE CATEGORÍAS (GRID PRINCIPAL)
// ========================

async function fetchCategoriesAdmin() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const cats = await response.json();

        // 1. Actualizar tabla de categorías
        const tbody = document.querySelector('#categoriesTable tbody');
        if (tbody) {
            tbody.innerHTML = '';
            cats.forEach(c => {
                tbody.innerHTML += `
                    <tr>
                        <td>${c.id}</td>
                        <td>${c.nombre}</td>
                        <td><span class="badge" style="background:#eee; padding:2px 5px; border-radius:3px; font-size:12px;">${c.layout_type}</span></td>
                        <td>
                            <button onclick="editCategory(${c.id}, '${c.nombre}', '${c.layout_type}', '${c.link_text}')" class="action-btn edit-btn">Editar</button>
                            <button onclick="deleteCategory(${c.id})" class="action-btn delete-btn">Eliminar</button>
                        </td>
                    </tr>
                `;
            });
        }

        // 2. Actualizar el select de categorías en el formulario de PRODUCTOS
        const catSelect = document.getElementById('id_categoria');
        if (catSelect) {
            catSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        }

    } catch (err) {
        console.error("Error cargando categorías:", err);
    }
}

const categoryForm = document.getElementById('categoryForm');
if (categoryForm) {
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('categoryId').value;
        const nombre = document.getElementById('cat-nombre').value;
        const layout_type = document.getElementById('cat-layout').value;
        const link_text = document.getElementById('cat-link').value;
        const adminEmail = sessionStorage.getItem('adminEmail');

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/categories/${id}` : `${API_URL}/categories`;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, layout_type, link_text, adminEmail })
        });

        if (response.ok) {
            alert("Categoría guardada.");
            resetCategoryForm();
            fetchCategoriesAdmin();
        }
    });
}

window.editCategory = (id, nombre, layout, link) => {
    document.getElementById('categoryId').value = id;
    document.getElementById('cat-nombre').value = nombre;
    document.getElementById('cat-layout').value = layout;
    document.getElementById('cat-link').value = link;
    document.getElementById('cancelCatBtn').style.display = 'inline-block';
};

document.getElementById('cancelCatBtn')?.addEventListener('click', resetCategoryForm);

function resetCategoryForm() {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('cancelCatBtn').style.display = 'none';
}

window.deleteCategory = async (id) => {
    if (confirm("¿Seguro que quieres eliminar esta categoría? Los productos asociados se quedarán sin categoría.")) {
        const adminEmail = sessionStorage.getItem('adminEmail');
        await fetch(`${API_URL}/categories/${id}?adminEmail=${adminEmail}`, {
            method: 'DELETE'
        });
        fetchCategoriesAdmin();
    }
};
