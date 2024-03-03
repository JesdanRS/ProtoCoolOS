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

    

    document.addEventListener('mousemove', function (event) {
        if (flechaEnProceso) {
            const rect = grafoContainer.getBoundingClientRect();
            const x1 = parseInt(nodoOrigen.style.left) + 15;
            const y1 = parseInt(nodoOrigen.style.top) + 15;
    
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
    
            const angle = Math.atan2(mouseY - y1, mouseX - x1) * (180 / Math.PI);
            const length = Math.sqrt((mouseX - x1) ** 2 + (mouseY - y1) ** 2);
    
            flechaEnProceso.style.width = length + 'px';
            flechaEnProceso.style.transform = `rotate(${angle}deg)`;
            flechaEnProceso.style.position = 'absolute';
            flechaEnProceso.style.left = x1 + 'px';
            flechaEnProceso.style.top = y1 + 'px';
        }
    
        if (isCtrlPressed && isDragging && nodoOrigen) {
            const x = event.clientX + startX;
            const y = event.clientY + startY;
            nodoOrigen.style.left = x + 'px';
            nodoOrigen.style.top = y + 'px';
    
            // También actualiza la posición de las flechas conectadas al nodo
            actualizarPosicionFlechas(nodoOrigen);
        }
    });
    grafoContainer.addEventListener('mouseup', function (event) {
        if (isDragging) {
            isDragging = false;
            nodoOrigen = null;

            actualizarPosicionFlechas(nodoOrigen);
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


    function actualizarPosicionFlechas(nodo) {
        const idNodo = nodo.getAttribute('data-id');
    
        // Actualiza la posición de las flechas conectadas al nodo de inicio
        const flechasInicio = document.querySelectorAll(`.flecha[data-nodo-inicio="${idNodo}"]`);
        flechasInicio.forEach(flecha => {
            const nodoFinId = flecha.getAttribute('data-nodo-fin');
            const nodoFin = document.querySelector(`.nodo[data-id="${nodoFinId}"]`);
            const atributoText = document.querySelector(`.atributo-text[data-flecha-id="${flecha.getAttribute('data-id')}"]`);
    
            if (nodoFin && atributoText) {
                const xFin = parseInt(nodoFin.style.left) + 15;
                const yFin = parseInt(nodoFin.style.top) + 15;
                actualizarFlecha(flecha, xFin, yFin);
    
                // Actualiza la posición del atributo sobre la flecha
                const xMedio = (parseInt(nodo.style.left) + xFin) / 2;
                const yMedio = (parseInt(nodo.style.top) + yFin) / 2;
                atributoText.style.left = `${xMedio}px`;
                atributoText.style.top = `${yMedio - 20}px`;
            }
        });
    
        // Actualiza la posición de las flechas conectadas al nodo de destino
        const flechasDestino = document.querySelectorAll(`.flecha[data-nodo-fin="${idNodo}"]`);
        flechasDestino.forEach(flecha => {
            const nodoInicioId = flecha.getAttribute('data-nodo-inicio');
            const nodoInicio = document.querySelector(`.nodo[data-id="${nodoInicioId}"]`);
            const atributoText = document.querySelector(`.atributo-text[data-flecha-id="${flecha.getAttribute('data-id')}"]`);
    
            if (nodoInicio && atributoText) {
                const xInicio = parseInt(nodoInicio.style.left) + 15;
                const yInicio = parseInt(nodoInicio.style.top) + 15;
                actualizarFlecha(flecha, xInicio, yInicio);
    
                // Actualiza la posición del atributo sobre la flecha
                const xMedio = (parseInt(nodoInicio.style.left) + parseInt(nodo.style.left)) / 2;
                const yMedio = (parseInt(nodoInicio.style.top) + parseInt(nodo.style.top)) / 2;
                atributoText.style.left = `${xMedio}px`;
                atributoText.style.top = `${yMedio - 20}px`;
            }
        });
    }

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
        const nodoInicioId = flecha.getAttribute('data-nodo-inicio');
        const nodoFinId = flecha.getAttribute('data-nodo-fin');
    
        const nodoInicio = document.querySelector(`.nodo[data-id="${nodoInicioId}"]`);
        const nodoFin = document.querySelector(`.nodo[data-id="${nodoFinId}"]`);
    
        if (nodoInicio && nodoFin) {
            const x1 = parseInt(nodoInicio.style.left) + 15;
            const y1 = parseInt(nodoInicio.style.top) + 15;
    
            const x2 = parseInt(nodoFin.style.left) + 15;
            const y2 = parseInt(nodoFin.style.top) + 15;
    
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    
            flecha.style.width = length + 'px';
            flecha.style.transform = `rotate(${angle}deg)`;
            flecha.style.position = 'absolute';
            flecha.style.left = x1 + 'px';
            flecha.style.top = y1 + 'px';
        }
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
        eliminarFlechasConectadasANodo(nodo); // Eliminar flechas conectadas al nodo
        grafoContainer.removeChild(nodo); // Eliminar el nodo del DOM
        
        // Eliminar el nodo de la matriz de adyacencia
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
        
        if (nuevoNombre !== null && nuevoNombre.trim() !== "" && nuevoNombre !== nombreActual) {
            // Almacenar temporalmente las conexiones existentes
            let conexionesTemporales = [];
            nodos.forEach(nodoInicio => {
                const celdaInicio = document.getElementById(`celda-${nodoInicio}-${nombreActual}`);
                if (celdaInicio && celdaInicio.textContent !== '0') {
                    conexionesTemporales.push({ inicio: nodoInicio, fin: nombreActual, valor: celdaInicio.textContent });
                }
    
                const celdaFin = document.getElementById(`celda-${nombreActual}-${nodoInicio}`);
                if (celdaFin && celdaFin.textContent !== '0') {
                    conexionesTemporales.push({ inicio: nombreActual, fin: nodoInicio, valor: celdaFin.textContent });
                }
            });
    
            // Actualizar el nombre en la lista de nodos
            const index = nodos.indexOf(nombreActual);
            if (index !== -1) {
                nodos[index] = nuevoNombre;
            }
    
            // Actualizar el nombre del nodo en el DOM
            nodo.textContent = nuevoNombre;
            
            // Reestablecer las celdas con los valores almacenados
            conexionesTemporales.forEach(conexion => {
                const celdaInicio = document.getElementById(`celda-${conexion.inicio}-${conexion.fin}`);
                if (conexion.fin === nombreActual && celdaInicio) {
                    celdaInicio.setAttribute('id', `celda-${conexion.inicio}-${nuevoNombre}`);
                }
                const celdaFin = document.getElementById(`celda-${conexion.fin}-${conexion.inicio}`);
                if (conexion.inicio === nombreActual && celdaFin) {
                    celdaFin.setAttribute('id', `celda-${nuevoNombre}-${conexion.fin}`);
                }
            });
    
            // Actualizar los identificadores y textos de las flechas afectadas
            document.querySelectorAll(`.flecha[data-nodo-inicio="${nodo.getAttribute('data-id')}"], .flecha[data-nodo-fin="${nodo.getAttribute('data-id')}"]`).forEach(flecha => {
                if (flecha.getAttribute('data-nodo-inicio') === nodo.getAttribute('data-id')) {
                    flecha.setAttribute('data-nodo-inicio-nombre', nuevoNombre);
                }
                if (flecha.getAttribute('data-nodo-fin') === nodo.getAttribute('data-id')) {
                    flecha.setAttribute('data-nodo-fin-nombre', nuevoNombre);
                }
            });
    
            // Actualizar la matriz de adyacencia en la interfaz de usuario
            actualizarMatrizUI();
    
            // Restaurar las conexiones en la matriz de adyacencia
            conexionesTemporales.forEach(conexion => {
                actualizarConexionEnMatriz(
                    conexion.inicio === nombreActual ? nuevoNombre : conexion.inicio,
                    conexion.fin === nombreActual ? nuevoNombre : conexion.fin,
                    conexion.valor
                );
            });
        }
    }
    

    let nodos = []; // Array para mantener los nombres de los nodos


function actualizarMatrizUI() {
    const header = document.getElementById('matriz-header');
    const body = document.getElementById('matriz-body');

    // Limpiar el encabezado y el cuerpo de la matriz
    header.innerHTML = '<th></th>';
    body.innerHTML = '';

    // Crear el encabezado de la matriz
    nodos.forEach(nombre => {
        const th = document.createElement('th');
        th.textContent = nombre;
        header.appendChild(th);
    });

    // Crear las filas y celdas de la matriz
    nodos.forEach((nombreFila, i) => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = nombreFila;
        tr.appendChild(th);

        nodos.forEach((nombreColumna, j) => {
            const td = document.createElement('td');
            td.textContent = '0'; // Inicializar con 0
            td.setAttribute('id', `celda-${nombreFila}-${nombreColumna}`); // Usar nombres de nodos para IDs
            tr.appendChild(td);
        });

        body.appendChild(tr);
    });

    // Restaurar las conexiones existentes en la matriz de adyacencia
    const flechas = document.querySelectorAll('.flecha');
    flechas.forEach((flecha) => {
        const nodoInicioNombre = flecha.getAttribute('data-nodo-inicio-nombre');
        const nodoFinNombre = flecha.getAttribute('data-nodo-fin-nombre');
        const atributo = flecha.getAttribute('data-atributo');
        
        // Si los nombres de los nodos inicio y fin están en la lista de nodos, actualizamos la celda correspondiente
        if (nodos.includes(nodoInicioNombre) && nodos.includes(nodoFinNombre)) {
            const celda = document.getElementById(`celda-${nodoInicioNombre}-${nodoFinNombre}`);
            if (celda) {
                celda.textContent = atributo;
            }
        }
    });
}


function agregarNodoAMatriz(nombreNodo) {
    // Guardar las conexiones existentes antes de actualizar la matriz
    let conexionesRestantes = [];
    nodos.forEach(nodoInicio => {
        nodos.forEach(nodoFin => {
            const celda = document.getElementById(`celda-${nodoInicio}-${nodoFin}`);
            if (celda && celda.textContent !== '0') {
                conexionesRestantes.push({
                    inicio: nodoInicio,
                    fin: nodoFin,
                    valor: celda.textContent
                });
            }
        });
    });

    // Agregar el nombre del nuevo nodo a la lista de nodos
    nodos.push(nombreNodo);

    // Actualizar la matriz de adyacencia y la UI con el nuevo nodo
    actualizarMatrizUI();

    // Restaurar las conexiones restantes en la matriz de adyacencia
    conexionesRestantes.forEach(conexion => {
        actualizarConexionEnMatriz(conexion.inicio, conexion.fin, conexion.valor);
    });

    // Asegurarse de que las nuevas celdas para el nuevo nodo estén configuradas correctamente
    nodos.forEach((nodoExistente) => {
        if (nodoExistente !== nombreNodo) {
            document.getElementById(`celda-${nodoExistente}-${nombreNodo}`).textContent = '0';
            document.getElementById(`celda-${nombreNodo}-${nodoExistente}`).textContent = '0';
        }
    });
}

/*
// Esta función actualiza los valores de las conexiones en la matriz de adyacencia.
function actualizarConexionEnMatriz(origen, destino, atributo) {
    const celda = document.getElementById(`celda-${origen}-${destino}`);
    if (celda) {
        celda.textContent = atributo; // Actualizar con el atributo de la conexión
    }
}*/

// Esta función necesita ser modificada para usar los nuevos nombres de los nodos
function actualizarConexionEnMatriz(origen, destino, atributo) {
    const celda = document.getElementById(`celda-${origen}-${destino}`);
    if (celda) {
        celda.textContent = atributo; // Actualizar con el atributo de la conexión
    }
}


// Esta función maneja la eliminación de nodos y actualiza la matriz de adyacencia.
function eliminarNodoDeMatriz(nombreNodo) {
    // Guardar las conexiones existentes que no involucran al nodo eliminado
    let conexionesRestantes = [];
    nodos.forEach(nodoInicio => {
        nodos.forEach(nodoFin => {
            if (nodoInicio !== nombreNodo && nodoFin !== nombreNodo) {
                const celda = document.getElementById(`celda-${nodoInicio}-${nodoFin}`);
                if (celda && celda.textContent !== '0') {
                    conexionesRestantes.push({
                        inicio: nodoInicio,
                        fin: nodoFin,
                        valor: celda.textContent
                    });
                }
            }
        });
    });

    // Eliminar el nodo del array de nodos
    const index = nodos.indexOf(nombreNodo);
    if (index > -1) {
        nodos.splice(index, 1);
    }

    // Actualizar la matriz de adyacencia y la UI
    actualizarMatrizUI();

    // Restaurar las conexiones restantes en la matriz de adyacencia
    conexionesRestantes.forEach(conexion => {
        actualizarConexionEnMatriz(conexion.inicio, conexion.fin, conexion.valor);
    });
}


document.getElementById('limpiarBtn').addEventListener('click', function () {
    limpiarContenedores();
});

function limpiarContenedores() {
    // Elimina todos los nodos y flechas dentro del contenedor de grafos
    while (grafoContainer.firstChild) {
        grafoContainer.removeChild(grafoContainer.firstChild);
    }

    // Limpia el contenido de las celdas en la matriz
    const celdasMatriz = document.querySelectorAll('#matriz-adyacencia td');
    celdasMatriz.forEach(celda => {
        celda.textContent = '0';
    });

    // Restablece los arrays y contadores según sea necesario
    nodos = [];
    idNodo = 0;
    idFlecha = 0;

    // Actualiza la matriz de adyacencia
    actualizarMatrizUI();
}

});