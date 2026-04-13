# Proyecto Final DAW - Clon de Amazon

## 1. Portada
- **Proyecto:** Clon de Amazon Fullstack
- **Módulo:** Desarrollo Web en Entorno Cliente y Servidor (DAW)
- **Tecnologías:** HTML5, CSS3, JavaScript Vanilla (Frontend) | Node.js, Express, MySQL (Backend)

---

## 2. Índice de Contenidos
1. Portada
2. Índice de Contenidos
3. Descripción del proyecto
4. Análisis de requerimientos
5. Arquitectura Dinámica y Esquemas
6. Tecnologías Frontend y Backend
7. Diseño de Persistencia de dades (MySQL)
8. Flujo de Desarrollo Evolutivo
9. Dependencias y Paquetería
10. Rutas (Endpoints) y API RESTful
11. Funcionalidades y Patrulla de Seguridad
12. Conclusión
13. **Manual de Uso e Instalación Correcta**

---

## 3. Descripción del Proyecto
El proyecto consiste en el desarrollo de una aplicación web completa que clona el e-commerce "Amazon". Nuestro objetivo ha sido integrar todas las destrezas de programación: Frontend (Maquetación, JS Vanilla Asíncrono) y Backend (Creación de API RESTful con Seguridad, conexión a Base de Datos y control de Roles/Baneos), logrando un proyecto pulido y profesional.

---

## 4. Análisis de Requerimientos
- **Front Office (Parte Pública):** Listados dinámicos sacados de BD, buscador funcional en tiempo real (SQL Likes), paginación, interceptación de usuarios baneados, persistencias locales del carrito de compras y rendering asíncrono de fichas de producto completas.
- **Back Office (Control Privado):** Una página protegida de "Administrador" mediante una barrera de login que provee operaciones CRUD estructuradas contra el catálogo.
- **Sistema de Seguridad RBAC:** Control de accesos con variables de sesión y control en tiempo real en Front Office.

---

## 5. Arquitectura Dinámica y Esquemas
1. **Header:** Buscador, menú, y control inteligente (detecta si es un usuario "user", "staff" o "admin" de forma transparente e independiente).
2. **Fichas de Producto Dinámicas:** Plantilla HTML base vacía, rellenada milimétricamente en JS cargando su correspondiente imagen y sus pares de atributos (Marca, Dimensiones) provenientes de JSON de Texto incrustado en BDD.
3. **Módulo de Usuarios VIP:** Panel de control de administradores generado puramente en Javascript para evitar vulnerabilidades estáticas de inyección HTML.

---

## 6. Tecnologías Utilizadas
- **Frontend:** Responsive Web Design puro (HTML/CSS) respetando un rendimiento ligero. Fetch API combinando sintaxis Modern ES6 (`async/await`) sobre un ecosistema de Local y Session Storages.
- **Backend:** `Node.js` con el framework `Express`. Justificación: Al usar JS en el backend, la consistencia full-stack permite unificar conceptos, logrando una conexión fluida a base de datos gracias a controladores robustos.

---

## 7. Diseño de la Persistencia de Datos (MySQL)
La base de datos `amazon_db` contiene el siguiente modelo relacional expandido:
- **Tabla `categorias`:** `id` (PK), `nombre`.
- **Tabla `productos`:** `id` (PK), `title`, `price`, `image`, `description`, `detalles` (Texto libre para especificaciones técnicas), `id_categoria` (FK).
- **Tabla `usuarios`:** `id` (PK), `nombre`, `email` (Unique), `password`, `rol` (ENUM: 'admin', 'staff', 'user'), `ban_until` (DATETIME), `ban_reason` (TEXT).

---

## 8. Flujo de Desarrollo Evolutivo
1. Ensamblaje de Maquetación y Datos Falsos en JSON local.
2. Puesta en marcha de NPM, Express, middlewares de CORS y bases de datos MySQL.
3. Refactorización para consumir el inventario exclusivamente mediante llamadas a puerto remoto.
4. Implementación de plantillas detalladas únicas (`product.html?id=X`).
5. **Creación de Seguridad Avanzada:** Implementación de Blacklists (Baneos de control temporal), Whitelists (Ascenso a cuentas *Staff*) y control perimetral absoluto del Back Office.

---

## 9. Dependencias y Paquetería (`/backend/package.json`)
La ejecución del servidor se respalda en los siguientes soportes:
- `express`: Framework servidor REST y enrutamiento.
- `cors`: Da permeabilidad de intercambio desde los HTML estáticos de puertos variables hasta la matriz Backend (Cross-Origin).
- `mysql2`: Driver nativo de comunicación que soporta peticiones pool y wrappers de Promesas.
- `dotenv`: Manejo de Variables Generales estáticas (.env).

---

## 10. Rutas (Endpoints) y API RESTful
*Catálogo y Productos:*
- `GET /api/products`: Lista el inventario JSON. Admite búsquedas y límites HTTP.
- `GET /api/products/:id`: Muestra las entrañas técnicas de un solo artículo.
- `POST`, `PUT`, `DELETE /api/products/:id`: Herramientas de edición para Staff/Admins modificando MySQL en directo.

*Usuarios y Seguridad (Exclusivos):*
- `POST /api/login`: Resuelve contraseñas y choca contra los tiempos del sistema para frenar baneados, respondiendo HTTP 403 Forbidden.
- `GET /api/users/:email/status`: Herramienta silenciosa empleada por `main.js` para escaneo de cuentas fraudulentas.
- `GET`, `PUT`, `DELETE /api/users/*`: El ecosistema donde el Root gestiona la pirámide de privilegios, inyectando minutos a baneos y alterando rangos.

---

## 11. Funcionalidades y Patrulla de Seguridad
- **Expulsión Silenciosa:** Si un usuario sancionado navega por la tienda con una sesión que guardó antes en localStorage, su Javascript de cabecera será interceptado forzosamente destruyendo sus permisos y mostrándole su veredicto, todo ello dejándole intacto su carro de compras personal para que no pierda sus selecciones pasadas.
- **Admin Compartido:** "Staff" y "Admin" entran en `admin.html`, pero la máquina de JS detecta que eres Staff ocultando en la sombra todos los apartados extra de control de población (Solo ven Edición de Productos).

---

## 12. Conclusión
El proyecto final ha evolucionado desde una réplica visual frontal (Front-End mock) hasta transformarse en una arquitectura de servicio real escalable. La separación del servidor central autoritativo (Node.js) demostró ser fundamental para establecer el complejo sistema de Autoridades (Usuarios vs Moderadores vs Administradores), resultando en ser una aplicación perfectamente defendible en cualquier prueba de un tribunal académico.

---

# 13. Manual de Uso e Instalación Correcta
Si deseas ejecutar todo el empaquetado del software tras instalarlo por primera vez o reanudar el trabajo, sigue estrictamente este orden:

### Paso 1: Encender y preparar el Backend
1. Inicia tus servicios de desarrollo general y asegúrate de que **MySQL local (ej. XAMPP)** esté funcionando en el puerto predeterminado.
2. Abre tu terminal de sistema y navega hasta la ruta del servidor:
   ```bash
   cd amazon_proyecto-main/backend
   ```
3. *(Sólo la primera vez)* Instala todos los motores listados de dependencias con:
   ```bash
   npm install
   ```
4. Despierta el servidor Node.js ejecutando:
   ```bash
   node server.js
   ```
   *Sabrás que todo está correcto si lees `Server running on port 3000` en tu terminal.*

### Paso 2: Administrar la Tienda (Panel Root)
1. Con tu backend ejecutándose en segundo plano, abre cualquier archivo HTML como `index.html` e interactúa con fluidez.
2. Para gestionar los elementos y realizar baneos dirígete a `.../admin/admin.html`.
3. Verás un menu restrictivo exigiéndote correo. El sistema instala de fábrica este usuario invulnerable en MySQL:
   - **Email:** `admin`
   - **Contraseña:** `1234`
4. Al entrar accederás a toda la gestión. Puedes pedir a amigos que pasen por la tienda pública y se registren para, a posteriori, usar este usuario `admin` e imponerles rangos o aplicarles suspensiones de 5 minutos al instante para observar su comportamiento.

importar base de datos:
mysql -u root -p amazon_db < "url"