document.addEventListener('DOMContentLoaded', function() {
    const pasos = [
        {
            elemento: document.getElementById('navMenu'),
            mensaje: 'Aquí puedes navegar a diferentes secciones de nuestro sitio.',
        },
        {
            elemento: document.getElementById('contenedor-general'),
            mensaje: 'Este es el área central de interacción donde puedes ver y editar los grafos.',
            posicionMedio: true,
        },
        {
            elemento: document.getElementById('cambiarColorBtn'),
            mensaje: 'Aquí puedes cambiar el color de los nodos seleccionados.',
        },
        {
            elemento: document.getElementById('eliminarBtn'),
            mensaje: 'Usa este botón para eliminar nodos o conexiones seleccionados.',
        },
        {
            elemento: document.getElementById('guardarBtn'),
            mensaje: 'Guarda el estado actual de tu grafo aquí.',
        },
        {
            elemento: document.getElementById('cargarBtn'),
            mensaje: 'Carga un grafo previamente guardado.',
        },
        {
            elemento: document.getElementById('limpiarBtn'),
            mensaje: 'Limpia el lienzo y empieza de nuevo.',
        }
    ];

    let pasoActual = 0;

    function agregarOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    }

    function quitarOverlay() {
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    function mostrarPaso(paso) {
        ocultarPasos();
        agregarOverlay();

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `<p>${paso.mensaje}</p><div style="margin-top: 10px;">`;

        if (pasoActual > 0) {
            tooltip.innerHTML += `<button onclick="anteriorPaso()"><span>←</span></button>`;
        }

        if (pasoActual < pasos.length - 1) {
            tooltip.innerHTML += `<button onclick="siguientePaso()"><span>✓</span></button>`;
        } else {
            tooltip.innerHTML += `<button onclick="finalizarTutorial()"><span>✓</span></button>`;
        }
        tooltip.style.zIndex = '10001';
        tooltip.innerHTML += `</div>`;
        document.body.appendChild(tooltip);

        const rect = paso.elemento.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY}px`;

        if (paso.posicionMedio) {
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2 - tooltip.offsetHeight / 2}px`;
        }

        paso.elemento.classList.add('resaltar');
        paso.elemento.style.position = 'relative';
        paso.elemento.style.zIndex = '10001'; // Ensure the highlighted part is above the overlay
    }

    function ocultarPasos() {
        document.querySelectorAll('.tooltip').forEach(tooltip => tooltip.remove());
        document.querySelectorAll('.resaltar').forEach(elemento => {
            elemento.classList.remove('resaltar');
            elemento.style.zIndex = ''; // Reset custom z-index after highlighting
        });
        quitarOverlay();
    }

    window.anteriorPaso = function() {
        if (pasoActual > 0) {
            pasoActual--;
            mostrarPaso(pasos[pasoActual]);
        }
    };

    window.siguientePaso = function() {
        if (pasoActual < pasos.length - 1) {
            pasoActual++;
            mostrarPaso(pasos[pasoActual]);
        }
    };

    window.finalizarTutorial = function() {
        ocultarPasos();
        pasoActual = 0;
        alert('Fin del tutorial. Gracias por participar.');
    };

    document.getElementById('helpBtn').addEventListener('click', function() {
        mostrarPaso(pasos[pasoActual]);
    });
});
