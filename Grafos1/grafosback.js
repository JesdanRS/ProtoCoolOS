document.addEventListener('DOMContentLoaded', function () {
    const grafoContainer = document.getElementById('grafo-container');
    let nodoOrigen = null;
    let flechaEnProceso = null;
    let isCtrlPressed = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // Detectar cuando se presiona la tecla Ctrl
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Control') {
            isCtrlPressed = true;
        }
    });

    // Detectar cuando se suelta la tecla Ctrl
    document.addEventListener('keyup', function (event) {
        if (event.key === 'Control') {
            isCtrlPressed = false;
        }
    });

    grafoContainer.addEventListener('mousedown', function (event) {
        const nodoClic = event.target.closest('.nodo');
        if (nodoClic) {
            if (!isCtrlPressed) {
                nodoOrigen = nodoClic;
                event.preventDefault();
                flechaEnProceso = crearFlecha(nodoOrigen, event.clientX, event.clientY);
            } else {
                nodoOrigen = nodoClic;
                startX = nodoOrigen.offsetLeft - event.clientX;
                startY = nodoOrigen.offsetTop - event.clientY;
                event.preventDefault();
                isDragging = true;
            }
        }
    });

    grafoContainer.addEventListener('mousemove', function (event) {
        if (isDragging && nodoOrigen) {
            const x = event.clientX + startX;
            const y = event.clientY + startY;
            nodoOrigen.style.left = x + 'px';
            nodoOrigen.style.top = y + 'px';
        }

        if (flechaEnProceso) {
            actualizarFlecha(flechaEnProceso, event.clientX, event.clientY);
        }
    });

    grafoContainer.addEventListener('mouseup', function (event) {
        if (isDragging) {
            isDragging = false;
            nodoOrigen = null;
        } else {
            const nodoDestino = event.target.closest('.nodo');
            if (flechaEnProceso && nodoDestino && nodoOrigen !== nodoDestino) {
                conectarNodos(nodoOrigen, nodoDestino);
            }
            eliminarFlechaEnProceso();
            nodoOrigen = null;
            flechaEnProceso = null;
        }
    });

    grafoContainer.addEventListener('click', function (event) {
        const x = event.clientX - grafoContainer.getBoundingClientRect().left - 15;
        const y = event.clientY - grafoContainer.getBoundingClientRect().top - 15;

        const nodoExistente = document.elementFromPoint(event.clientX, event.clientY).closest('.nodo');

        if (!nodoExistente && !isCtrlPressed) {
            crearNodo(x, y);
        }
    });

    // Agregar evento de doble clic para editar el texto del nodo
    grafoContainer.addEventListener('dblclick', function (event) {
        const nodoDobleClic = event.target.closest('.nodo');
        if (nodoDobleClic) {
            editarTextoNodo(nodoDobleClic);
        }
    });

    function crearNodo(x, y) {
        const nodo = document.createElement('div');
        nodo.className = 'nodo';
        nodo.style.left = x + 'px';
        nodo.style.top = y + 'px';
        grafoContainer.appendChild(nodo);
    }

    function crearFlecha(origen, x, y) {
        const flecha = document.createElement('div');
        flecha.className = 'flecha';
        grafoContainer.appendChild(flecha);

        const x1 = parseInt(origen.style.left) + 15;
        const y1 = parseInt(origen.style.top) + 15;
        const angle = Math.atan2(y - y1, x - x1) * (180 / Math.PI);
        const length = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);

        flecha.style.width = length + 'px';
        flecha.style.left = x1 + 'px';
        flecha.style.top = y1 + 'px';
        flecha.style.transform = 'rotate(' + angle + 'deg)';

        return flecha;
    }

    function actualizarFlecha(flecha, x, y) {
        const x1 = parseInt(flecha.style.left);
        const y1 = parseInt(flecha.style.top);
        const angle = Math.atan2(y - y1, x - x1) * (180 / Math.PI);
        const length = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);

        flecha.style.width = length + 'px';
        flecha.style.transform = 'rotate(' + angle + 'deg)';
    }

    function conectarNodos(origen, destino) {
        const flecha = document.createElement('div');
        flecha.className = 'flecha';
        grafoContainer.appendChild(flecha);

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
        flecha.innerHTML = '<div class="flecha-punta"></div>';
    }

    function eliminarFlechaEnProceso() {
        if (flechaEnProceso) {
            grafoContainer.removeChild(flechaEnProceso);
        }
    }

    // Botón HELP

    document.getElementById('helpBtn').addEventListener('click', function() {
        var popup = document.getElementById('helpPopup');
        if (popup.style.display == 'none' || popup.style.display == '') {
            popup.style.display = 'block';
        } else {
            popup.style.display = 'none';
        }
    });

    // End of Botón HELP

    // Función para editar el texto del nodo
    function editarTextoNodo(nodo) {
        // Crear un elemento de entrada de texto
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'nodo-texto';
        input.value = nodo.textContent;
        
        // Colocar el elemento de entrada de texto en el mismo lugar que el nodo
        input.style.left = nodo.style.left;
        input.style.top = nodo.style.top;
        
        // Reemplazar el nodo por el elemento de entrada de texto
        nodo.parentNode.replaceChild(input, nodo);
        
        // Enfocar el elemento de entrada de texto
        input.focus();
        
        // Cuando se pierde el foco del elemento de entrada de texto, guardar el valor y restaurar el nodo
        input.addEventListener('blur', function() {
            nodo.textContent = input.value;
            input.parentNode.replaceChild(nodo, input);
        });
    }
});

