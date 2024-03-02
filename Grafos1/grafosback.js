document.addEventListener('DOMContentLoaded', function () {
    const grafoContainer = document.getElementById('grafo-container');
    let idNodo = 0; // Contador global para identificadores de nodos
    let idFlecha = 0; // Contador global para identificadores de flechas
    let nodoOrigen = null;
    let flechaEnProceso = null;
    let isCtrlPressed = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Control') {
            isCtrlPressed = true;
        }
    });

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
        if (!isCtrlPressed) {
            const x = event.clientX - grafoContainer.getBoundingClientRect().left - 15;
            const y = event.clientY - grafoContainer.getBoundingClientRect().top - 15;
            const nodoExistente = document.elementFromPoint(event.clientX, event.clientY).closest('.nodo');

            if (!nodoExistente) {
                crearNodo(x, y);
            }
        }
    });

    grafoContainer.addEventListener('dblclick', function (event) {
        const nodoDobleClic = event.target.closest('.nodo');
        if (nodoDobleClic) {
            editarTextoNodo(nodoDobleClic);
        }
    });

    function crearNodo(x, y) {
        const nombreNodo = prompt("Ingrese el nombre del nodo:"); // Solicitar el nombre al usuario
        if (nombreNodo !== null && nombreNodo.trim() !== "") { // Verificar que el nombre no esté vacío
            const nodo = document.createElement('div');
            nodo.className = 'nodo';
            nodo.style.left = x + 'px';
            nodo.style.top = y + 'px';
            nodo.setAttribute('data-id', `nodo-${idNodo++}`); // Asignar ID único
            nodo.textContent = nombreNodo; // Establecer el nombre del nodo
            grafoContainer.appendChild(nodo);
    
            agregarNodoAMatriz(nombreNodo); // Actualizar la matriz de adyacencia
        }
    }


    function crearFlecha(origen, x, y) {
        const flecha = document.createElement('div');
        flecha.className = 'flecha';
        flecha.setAttribute('data-id', `flecha-${idFlecha++}`); // Asignar ID único
        flecha.setAttribute('data-nodo-inicio', origen.getAttribute('data-id')); // Asignar ID del nodo de origen
        grafoContainer.appendChild(flecha);
        actualizarFlecha(flecha, x, y);
        return flecha;
    }

    function actualizarFlecha(flecha, x, y) {
        const origen = document.querySelector(`.nodo[data-id="${flecha.getAttribute('data-nodo-inicio')}"]`);
        const x1 = parseInt(origen.style.left) + 15;
        const y1 = parseInt(origen.style.top) + 15;
        const angle = Math.atan2(y - y1, x - x1) * (180 / Math.PI);
        const length = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);

        flecha.style.width = length + 'px';
        flecha.style.transform = `rotate(${angle}deg)`;
        flecha.style.position = 'absolute';
        flecha.style.left = x1 + 'px';
        flecha.style.top = y1 + 'px';
    }

    function conectarNodos(origen, destino) {
        const atributo = prompt('Ingrese el atributo para la conexión:');
        if (atributo !== null) {
            const flecha = document.createElement('div');
            flecha.className = 'flecha';
            flecha.setAttribute('data-id', `flecha-${idFlecha++}`); // Asignar ID único
            flecha.setAttribute('data-nodo-inicio', origen.getAttribute('data-id')); // Nodo de origen
            flecha.setAttribute('data-nodo-fin', destino.getAttribute('data-id')); // Nodo de destino
            flecha.setAttribute('data-atributo', atributo); // Guarda el atributo
            actualizarFlecha(flecha, parseInt(destino.style.left) + 15, parseInt(destino.style.top) + 15);
            grafoContainer.appendChild(flecha);
    
            // Mostrar atributo en el contenedor
            mostrarAtributoEnContenedor(flecha);
    
            // Actualizar la matriz de adyacencia con el atributo de la conexión
            actualizarConexionEnMatriz(origen.textContent, destino.textContent, atributo);
        }
    }

    function mostrarAtributoEnContenedor(flecha) {
        const atributoText = document.createElement('div');
        atributoText.className = 'atributo-text';
        atributoText.textContent = flecha.getAttribute('data-atributo');
        atributoText.style.position = 'absolute';
        atributoText.style.color = 'white';
    
        // Obtener los nodos de inicio y fin usando los IDs almacenados en la flecha
        const nodoInicio = document.querySelector(`.nodo[data-id="${flecha.getAttribute('data-nodo-inicio')}"]`);
        const nodoFin = document.querySelector(`.nodo[data-id="${flecha.getAttribute('data-nodo-fin')}"]`);
    
        // Calcular el punto medio entre el nodo de inicio y fin
        const xInicio = parseInt(nodoInicio.style.left) + nodoInicio.offsetWidth / 2;
        const yInicio = parseInt(nodoInicio.style.top) + nodoInicio.offsetHeight / 2;
        const xFin = parseInt(nodoFin.style.left) + nodoFin.offsetWidth / 2;
        const yFin = parseInt(nodoFin.style.top) + nodoFin.offsetHeight / 2;
        
        // Punto medio
        const xMedio = (xInicio + xFin) / 2;
        const yMedio = (yInicio + yFin) / 2;
    
        // Ajustar la posición para que el texto aparezca sobre la flecha, no en el centro exacto
        atributoText.style.left = `${xMedio}px`;
        // Ajusta el valor '10' según sea necesario para posicionar mejor el texto sobre la flecha
        atributoText.style.top = `${yMedio - 20}px`; 
    
        atributoText.dataset.flechaId = flecha.getAttribute('data-id'); // Asignar ID único de la flecha
        grafoContainer.appendChild(atributoText);
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
    });

    function eliminarNodoYFlechas(nodo) {
        const nombreNodo = nodo.textContent; // Obtener el nombre del nodo antes de eliminarlo
        eliminarFlechasConectadasANodo(nodo); // Función existente para eliminar flechas
        grafoContainer.removeChild(nodo); // Función existente para eliminar el nodo del DOM
        
        // Llamada nueva función para eliminar el nodo de la matriz y actualizar la UI
        eliminarNodoDeMatriz(nombreNodo);
    }

    function eliminarFlechasConectadasANodo(nodo) {
        const idNodo = nodo.getAttribute('data-id');
        const flechas = document.querySelectorAll('.flecha');
        flechas.forEach((flecha) => {
            const nodoInicioId = flecha.getAttribute('data-nodo-inicio');
            const nodoFinId = flecha.getAttribute('data-nodo-fin');

            if (nodoInicioId === idNodo || nodoFinId === idNodo) {
                eliminarAtributosDeFlecha(flecha);
                grafoContainer.removeChild(flecha);
            }
        });
    }

    function eliminarAtributosDeFlecha(flecha) {
        const flechaId = flecha.getAttribute('data-id');
        const atributos = document.querySelectorAll('.atributo-text');
        atributos.forEach((atributo) => {
            if (atributo.dataset.flechaId === flechaId) {
                grafoContainer.removeChild(atributo);
            }
        });
    }

    function editarTextoNodo(nodo) {
        const nombreActual = nodo.textContent; // Obtener el nombre actual del nodo
        const nuevoNombre = prompt("Editar nombre del nodo:", nombreActual); // Solicitar el nuevo nombre, mostrando el actual como predeterminado
    
        if (nuevoNombre !== null && nuevoNombre.trim() !== "") { // Verificar que el nombre no esté vacío
            nodo.textContent = nuevoNombre; // Actualizar con el nuevo nombre
        }
    }
    document.getElementById('guardarBtn').addEventListener('click', function () {
        guardarComoImagen();
    });

    let nodos = []; // Array para mantener los nombres de los nodos

function actualizarMatrizUI() {
    // Actualiza la cabecera de la matriz
    const header = document.getElementById('matriz-header');
    header.innerHTML = '<th></th>'; // Limpiar y añadir la celda vacía inicial
    nodos.forEach(nombre => {
        const th = document.createElement('th');
        th.textContent = nombre;
        header.appendChild(th);
    });

    // Actualizar el cuerpo de la matriz
    const body = document.getElementById('matriz-body');
    body.innerHTML = ''; // Limpiar el cuerpo de la matriz
    nodos.forEach((nombreFila, i) => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = nombreFila;
        tr.appendChild(th);

        nodos.forEach((nombreColumna, j) => {
            const td = document.createElement('td');
            td.textContent = '0'; // Valor predeterminado
            td.setAttribute('id', `celda-${i}-${j}`); // ID único para cada celda
            tr.appendChild(td);
        });

        body.appendChild(tr);
    });
}

function agregarNodoAMatriz(nombreNodo) {
    nodos.push(nombreNodo); // Agregar el nombre del nuevo nodo
    actualizarMatrizUI(); // Actualizar la UI de la matriz
}

function actualizarConexionEnMatriz(origen, destino, atributo) {
    const indiceOrigen = nodos.indexOf(origen);
    const indiceDestino = nodos.indexOf(destino);

    if (indiceOrigen !== -1 && indiceDestino !== -1) {
        const celda = document.getElementById(`celda-${indiceOrigen}-${indiceDestino}`);
        if (celda) {
            celda.textContent = atributo; // Actualizar con el atributo de la conexión
        }
    }
}

function eliminarNodoDeMatriz(nombreNodo) {
    // Eliminar el nodo del array de nodos
    const index = nodos.indexOf(nombreNodo);
    if (index > -1) {
        nodos.splice(index, 1);
    }

    // Actualizar la matriz de adyacencia y la UI
    actualizarMatrizUI();
}


});