document.addEventListener("DOMContentLoaded", async () => {
    const track = document.querySelector(".carousel-track");
    const btnAnterior = document.querySelector(".anterior");
    const btnSiguiente = document.querySelector(".siguiente");

    // --- 1. Obtención Dinámica de Imágenes ---
    let carouselItems = [];
    try {
        const response = await fetch("http://localhost:3000/api/carousel");
        if (response.ok) {
            carouselItems = await response.json();
        }
    } catch (err) {
        console.error("Error cargando carrusel dinámico:", err);
    }

    // Lógica de Fallback (Si la BD está vacía o hay error)
    if (carouselItems.length === 0) {
        console.warn("Usando imágenes de respaldo para el carrusel.");
        carouselItems = [
            { image_url: "imagenes/img/imagen_1.jpg", alt_text: "Banner 1" },
            { image_url: "imagenes/img/imagen_2.jpg", alt_text: "Banner 2" }
        ];
    }

    // Inyectar diapositivas en el DOM
    track.innerHTML = carouselItems.map(item => `
        <div class="carousel-slide">
            <img src="${item.image_url}" alt="${item.alt_text}">
        </div>
    `).join("");

    // --- 2. Preparación para Bucle Infinito ---
    const originalSlides = Array.from(track.children);
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

    track.appendChild(firstClone);
    track.prepend(lastClone);

    const slides = Array.from(track.children);
    let indiceActual = 1;
    let autoPlay;

    // Posición inicial
    let anchoSlide = slides[0].getBoundingClientRect().width;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${anchoSlide * indiceActual}px)`;

    function moverCarrusel(indice) {
        track.style.transition = "transform 0.5s ease-in-out";
        track.style.transform = `translateX(-${anchoSlide * indice}px)`;
        indiceActual = indice;
    }

    // Teletransporte
    track.addEventListener('transitionend', () => {
        if (indiceActual === slides.length - 1) {
            track.style.transition = 'none';
            indiceActual = 1;
            track.style.transform = `translateX(-${anchoSlide * indiceActual}px)`;
        }
        if (indiceActual === 0) {
            track.style.transition = 'none';
            indiceActual = slides.length - 2;
            track.style.transform = `translateX(-${anchoSlide * indiceActual}px)`;
        }
    });

    function pasarSiguiente() {
        if (indiceActual >= slides.length - 1) return;
        moverCarrusel(indiceActual + 1);
    }

    function reiniciarTimer() {
        clearInterval(autoPlay);
        autoPlay = setInterval(pasarSiguiente, 5000);
    }

    btnSiguiente.addEventListener("click", () => {
        pasarSiguiente();
        reiniciarTimer();
    });

    btnAnterior.addEventListener("click", () => {
        if (indiceActual <= 0) return;
        moverCarrusel(indiceActual - 1);
        reiniciarTimer();
    });

    autoPlay = setInterval(pasarSiguiente, 10000);

    window.addEventListener("resize", () => {
        anchoSlide = slides[0].getBoundingClientRect().width;
        track.style.transition = 'none';
        track.style.transform = `translateX(-${anchoSlide * indiceActual}px)`;
    });
});
