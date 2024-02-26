document.addEventListener('DOMContentLoaded', function () {
    const grafoContainer = document.getElementById('grafo-container');
    let nodoSeleccionado = null;

    grafoContainer.addEventListener('mousedown', function (event) {
        const nodoClic = event.target.closest('.nodo');
        if (nodoClic) {
            nodoSeleccionado = nodoClic;
            event.preventDefault();
        }
    });

    grafoContainer.addEventListener('mousemove', function (event) {
        if (nodoSeleccionado) {
            const x = event.clientX - grafoContainer.getBoundingClientRect().left - 15;
            const y = event.clientY - grafoContainer.getBoundingClientRect().top - 15;

            nodoSeleccionado.style.left = x + 'px';
            nodoSeleccionado.style.top = y + 'px';
        }
    });

    grafoContainer.addEventListener('mouseup', function (event) {
        if (nodoSeleccionado) {
            const nodoSoltado = event.target.closest('.nodo');

            if (nodoSoltado && nodoSoltado !== nodoSeleccionado) {
                crearFlecha(nodoSeleccionado, nodoSoltado);
            }

            nodoSeleccionado = null;
        }
    });

    function crearNodo(x, y) {
        const nodo = document.createElement('div');
        nodo.className = 'nodo';
        nodo.style.left = x + 'px';
        nodo.style.top = y + 'px';
        grafoContainer.appendChild(nodo);
    }

    function crearFlecha(origen, destino) {
        const flecha = document.createElement('div');
        flecha.className = 'flecha';
        const x1 = parseInt(origen.style.left) + 15;
        const y1 = parseInt(origen.style.top) + 15;
        const x2 = parseInt(destino.style.left) + 15;
        const y2 = parseInt(destino.style.top) + 15;
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

        flecha.style.width = length + 'px';
        flecha.style.left = x1 + 'px';
        flecha.style.top = y1 + 'px';
        flecha.style.transform = 'rotate(' + angle + 'deg)';
        grafoContainer.appendChild(flecha);
    }

    // Evento para crear nodo al hacer clic en el contenedor
    grafoContainer.addEventListener('click', function (event) {
        const x = event.clientX - grafoContainer.getBoundingClientRect().left - 15;
        const y = event.clientY - grafoContainer.getBoundingClientRect().top - 15;
        crearNodo(x, y);
    });
});
