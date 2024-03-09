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

    function mostrarPaso(paso) {
        ocultarPasos();
        removerDesenfoque();
        aplicarDesenfoque();
        paso.elemento.style.position = 'relative'; // Importante para que z-index funcione
        paso.elemento.style.zIndex = '1006'; // Asegúrate de que esté por encima de la capa de desenfoque

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        // Agrega tu HTML de tooltip aquí
        tooltip.style.zIndex = '1006';
        tooltip.innerHTML = `<p>${paso.mensaje}</p><div style="margin-top: 10px;">`;

        if (pasoActual > 0) {
            tooltip.innerHTML += `<button onclick="anteriorPaso()" style="margin-right: 5px;"><span style="margin-right: 5px;">←</span></button>`;
        }

        if (pasoActual < pasos.length - 1) {
            tooltip.innerHTML += `<button onclick="siguientePaso()"><span style="margin-left: 5px;">✓</span></button>`;
        } else {
            tooltip.innerHTML += `<button onclick="finalizarTutorial()"><span style="margin-left: 5px;">✓</span></button>`;
        }

        tooltip.innerHTML += `</div>`;
        document.body.appendChild(tooltip);
        ajustarZIndex(paso.elemento, tooltip);


        const rect = paso.elemento.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY}px`;

        if (paso.posicionMedio) {
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2 - tooltip.offsetHeight / 2}px`;
        }

        paso.elemento.classList.add('resaltar');
        aplicarDesenfoque();
    }

    function ocultarPasos() {
        document.querySelectorAll('.tooltip').forEach(tooltip => tooltip.remove());
        document.querySelectorAll('.resaltar').forEach(elemento => elemento.classList.remove('resaltar'));
        removerDesenfoque();
    }
    function ajustarZIndex(elemento, tooltip) {
        elemento.style.position = 'relative';
        elemento.style.zIndex = '1001';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '1001';
    }
    function aplicarDesenfoque() {
        // Crear o reutilizar la capa de desenfoque
        let capaDesenfoque = document.getElementById('capaDesenfoque');
        if (!capaDesenfoque) {
            capaDesenfoque = document.createElement('div');
            capaDesenfoque.id = 'capaDesenfoque';
            capaDesenfoque.style.position = 'fixed';
            capaDesenfoque.style.top = '0';
            capaDesenfoque.style.left = '0';
            capaDesenfoque.style.width = '100vw';
            capaDesenfoque.style.height = '100vh';
            capaDesenfoque.style.backgroundColor = 'rgba(0,0,0,0.5)';
            capaDesenfoque.style.zIndex = '999';
            capaDesenfoque.style.backdropFilter = 'blur(4px)';
            document.body.appendChild(capaDesenfoque);
        }
    }

    function removerDesenfoque() {
        const capaDesenfoque = document.getElementById('capaDesenfoque');
        if (capaDesenfoque) {
            capaDesenfoque.remove();
        }
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
        removerDesenfoque();
        pasoActual = 0;
        alert('Fin del tutorial. Gracias por participar.');
    };

    document.getElementById('helpBtn').addEventListener('click', function() {
        mostrarPaso(pasos[pasoActual]);
    });
});
