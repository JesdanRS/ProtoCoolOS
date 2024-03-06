document.addEventListener('DOMContentLoaded', function() {
    const pasos = [
        {
            elemento: document.getElementById('navMenu'), // Asegúrate de que este ID corresponda al contenedor de la barra de navegación
            mensaje: 'Aquí puedes navegar a diferentes secciones de nuestro sitio.',
        },
        {
            elemento: document.getElementById('contenedor-general'),
            mensaje: 'Este es el área central de interacción donde puedes ver y editar los grafos.',
            posicionMedio: true, // Indicador para ajustar la posición al medio
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
        // Si necesitas más pasos, puedes agregarlos aquí.
    ];

    let pasoActual = 0;

    function mostrarPaso(paso) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `<p>${paso.mensaje}</p>`;
        
        if (pasoActual < pasos.length - 1) { // Agrega botón "Siguiente" si no es el último paso
            tooltip.innerHTML += `<button onclick="siguientePaso()">Siguiente</button>`;
        } else {
            tooltip.innerHTML += `<button onclick="finalizarTutorial()">Finalizar</button>`;
        }

        document.body.appendChild(tooltip);
        const rect = paso.elemento.getBoundingClientRect();
        
        if (paso.posicionMedio) { // Si se indica que el tooltip debe ir en el medio del elemento
            tooltip.style.top = `${rect.top + window.scrollY + (rect.height / 2) - (tooltip.offsetHeight / 2)}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        } else {
            tooltip.style.top = `${rect.top + window.scrollY + rect.height + 10}px`;
            tooltip.style.left = `${rect.left}px`;
        }

        paso.elemento.classList.add('resaltar');
    }

    function ocultarPasos() {
        document.querySelectorAll('.tooltip').forEach(tooltip => tooltip.remove());
        document.querySelectorAll('.resaltar').forEach(elemento => elemento.classList.remove('resaltar'));
    }

    window.siguientePaso = function() {
        if (pasoActual < pasos.length - 1) {
            ocultarPasos();
            pasoActual++;
            mostrarPaso(pasos[pasoActual]);
        }
    };

    window.finalizarTutorial = function() {
        ocultarPasos();
        pasoActual = 0; // Opcional: reiniciar el tutorial
        alert('Fin del tutorial. Gracias por participar.');
    };

    document.getElementById('helpBtn').addEventListener('click', function() {
        mostrarPaso(pasos[pasoActual]);
    });
});
