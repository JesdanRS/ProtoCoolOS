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
        const atributo = prompt('Ingrese el atributo para la conexión:');
        if (atributo !== null) { // Verifica si el usuario ha ingresado un atributo
            const flecha = document.createElement('div');
            flecha.className = 'flecha';
            flecha.setAttribute('data-atributo', atributo); // Guarda el atributo en un atributo de datos
            grafoContainer.appendChild(flecha);

            const x1 = parseInt(origen.style.left) + 15;
            const y1 = parseInt(origen.style.top) + 15;
            const x2 = parseInt(destino.style.left) + 15;
            const y2 = parseInt(destino.style.top) + 15;
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            const length = Math.sqrt((x2 - x1)  **2 + (y2 - y1)  **2);

            flecha.style.width = length + 'px';
            flecha.style.left = x1 + 'px';
            flecha.style.top = y1 + 'px';
            flecha.style.transform = 'rotate(' + angle + 'deg)';
            flecha.innerHTML = '<div class="flecha-punta"></div>';

            // Crear y mostrar el número de atributo encima de la flecha
            const atributoText = document.createElement('div');
            atributoText.className = 'atributo-text';
            atributoText.textContent = atributo;
            atributoText.style.position = 'absolute';
            atributoText.style.color = 'white';
            atributoText.style.top = ((y1 + y2 - 50) / 2) + 'px';
            atributoText.style.left = ((x1 + x2) / 2) + 'px';
            grafoContainer.appendChild(atributoText);
        }
    }

    function eliminarFlechaEnProceso() {
        if (flechaEnProceso) {
            grafoContainer.removeChild(flechaEnProceso);
        }
    }

    
    grafoContainer.addEventListener('contextmenu', function (event) {
        event.preventDefault();

        const nodoClic = event.target.closest('.nodo');
        if (nodoClic) {
            eliminarNodoYFlechas(nodoClic);
        }

        const flechaClic = event.target.closest('.flecha');
        if (flechaClic) {
            eliminarFlecha(flechaClic);
        }
    });

    function eliminarFlecha(flecha) {
        grafoContainer.removeChild(flecha);
    }

    function eliminarNodoYFlechas(nodo) {
        eliminarFlechasConectadasANodo(nodo);
        eliminarNodo(nodo);
    }

    function eliminarFlechasConectadasANodo(nodo) {
        const flechas = document.querySelectorAll('.flecha');
        flechas.forEach((flecha) => {
            const nodoInicioId = flecha.dataset.nodoInicio;
            const nodoFinId = flecha.dataset.nodoFin;

            if (nodoInicioId === nodo.id || nodoFinId === nodo.id) {
                grafoContainer.removeChild(flecha);
            }
        });
    }
    function eliminarNodo(nodo) {
        grafoContainer.removeChild(nodo);
    }
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

    document.getElementById('guardarBtn').addEventListener('click', function () {
        guardarComoImagen();
    });

    function guardarComoImagen() {
        // Obtén el contenedor de grafo
        const grafoContainer = document.getElementById('grafo-container');
    
        // Guarda el color de fondo original y las sombras
        const fondoOriginal = window.getComputedStyle(grafoContainer).backgroundColor;
        const sombraOriginal = window.getComputedStyle(grafoContainer).boxShadow;
    
        // Establece un fondo negro y elimina sombras antes de convertir el contenido a una imagen
        grafoContainer.style.backgroundColor = 'black';
        grafoContainer.style.boxShadow = 'none';
    
        // Pide al usuario ingresar el nombre del archivo
        const nombreArchivo = prompt('Ingrese el nombre del archivo', 'grafo');
    
        // Si el usuario ingresó un nombre, convierte a imagen
        if (nombreArchivo !== null) {
            // Convierte el contenido del contenedor a una imagen utilizando html2canvas
            html2canvas(grafoContainer, { useCORS: true, backgroundColor: null }).then(function (canvas) {
                // Restaura el color de fondo original y las sombras
                grafoContainer.style.backgroundColor = fondoOriginal;
                grafoContainer.style.boxShadow = sombraOriginal;
    
                // Convierte el canvas a una representación binaria en formato PNG
                canvas.toBlob(function (blob) {
                    // Crea un enlace de descarga con el nombre ingresado
                    const enlaceDescarga = document.createElement('a');
                    enlaceDescarga.href = URL.createObjectURL(blob);
                    enlaceDescarga.download = nombreArchivo + '.png';
    
                    // Agrega el enlace de descarga al cuerpo del documento y haz clic en él
                    document.body.appendChild(enlaceDescarga);
                    enlaceDescarga.click();
    
                    // Elimina el enlace de descarga del cuerpo del documento
                    document.body.removeChild(enlaceDescarga);
                });
            });
        } else {
            // Si el usuario cancela, restaura el color de fondo original y las sombras
            grafoContainer.style.backgroundColor = fondoOriginal;
            grafoContainer.style.boxShadow = sombraOriginal;
        }
    }
    document.getElementById('limpiarBtn').addEventListener('click', function () {
        limpiarContenedor();
    });


    function limpiarContenedor() {
        // Guarda el color de fondo original y las sombras
        const fondoOriginal = window.getComputedStyle(grafoContainer).backgroundColor;
        const sombraOriginal = window.getComputedStyle(grafoContainer).boxShadow;
    
        // Elimina todos los nodos y flechas del contenedor
        const nodos = document.querySelectorAll('.nodo');
        nodos.forEach(nodo => {
            eliminarFlechasConectadasANodo(nodo);
            grafoContainer.removeChild(nodo);
        });
    
        const flechas = document.querySelectorAll('.flecha');
        flechas.forEach(flecha => grafoContainer.removeChild(flecha));
    
        // Restaura el color de fondo original y las sombras
        grafoContainer.style.backgroundColor = fondoOriginal;
        grafoContainer.style.boxShadow = sombraOriginal;
    }
});