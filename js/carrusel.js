// =====================================================
// =============== CARRUSEL AMAZON CLONE ===============
// =====================================================
// Archivo: carrusel.js
// Función: Controlar el movimiento del carrusel del banner
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // Seleccionamos los elementos del carrusel
    const track = document.querySelector(".carousel-track");
    const slides = Array.from(track.children);

    const btnAnterior = document.querySelector(".anterior");
    const btnSiguiente = document.querySelector(".siguiente");

    // Índice del slide actual
    let indiceActual = 0;

    // Función para mover el carrusel
    function moverCarrusel(indice) {
        const anchoSlide = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${anchoSlide * indice}px)`;
        indiceActual = indice;
    }

    // Botón siguiente
    btnSiguiente.addEventListener("click", () => {
        let siguiente = indiceActual + 1;
        if (siguiente >= slides.length) siguiente = 0; // Vuelve al inicio
        moverCarrusel(siguiente);
    });

    // Botón anterior
    btnAnterior.addEventListener("click", () => {
        let anterior = indiceActual - 1;
        if (anterior < 0) anterior = slides.length - 1; // Va al final
        moverCarrusel(anterior);
    });

    // Ajuste al cambiar tamaño de pantalla
    window.addEventListener("resize", () => moverCarrusel(indiceActual));
});
