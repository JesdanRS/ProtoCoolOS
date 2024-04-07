document.addEventListener('DOMContentLoaded', function() {
    const grafoContainer = document.getElementById('grafo-container');
    let nodos = new vis.DataSet(); // Inicializa con nodo raíz
    let aristas = new vis.DataSet();
    let network = null;
    let ultimoIdNodo = 1;
    let modoEliminar = false; // Variable para controlar el modo de eliminación

    const opciones = {
        nodes: {
            shape: 'circle',
            size: 14,
            font: {
                color: '#ffffff'
            },
            borderWidth: 2,
            color: {
                background: '#0040ff', // Azul oscuro
                highlight: {
                    background: '#0040ff' // Azul oscuro para nodos seleccionados
                }
            }
        },
        edges: {
            arrows: 'to',
            font: '12px arial #ff0000',
            scaling: {
                label: true
            },
            shadow: true
        },
        layout: {
            hierarchical: false
        },
        physics: true // Habilitar la física para permitir el movimiento de los nodos
    };
    
    function inicializarRed() {
        network = new vis.Network(grafoContainer, {nodes: nodos, edges: aristas}, opciones);
        
        network.once("click", function(params) { // Usamos 'once' para que este evento se dispare solo la primera vez
            const nombreNodoRaiz = prompt("Ingrese el valor del nodo raíz:", "");
            if (nombreNodoRaiz !== null && nombreNodoRaiz.trim() !== "") {
                nodos.add({id: 1, label: nombreNodoRaiz.trim(), value: parseInt(nombreNodoRaiz.trim(), 10), x: 0, y: 0, fixed: true, physics: false});
            } else {
                console.log("Debe ingresar un valor para el nodo raíz.");
            }
        });
        
        grafoContainer.addEventListener("click", function(event) {
            if (!modoEliminar) {
                // Si no estamos en modo eliminar, permitimos agregar nodos al hacer clic en el contenedor del grafo
                const nombreNodo = prompt("Ingrese el valor del nuevo nodo:", "");
                if (nombreNodo !== null) {
                    agregarNodoAlArbol(parseInt(nombreNodo, 10));
                }
            }
        });
    
        network.on("click", function(params) {
            if (modoEliminar) {
                // Si estamos en modo eliminar, eliminamos el nodo al que se le ha hecho clic
                const nodoEliminado = params.nodes[0];
                nodos.remove(nodoEliminado);
                
                // Eliminar las aristas conectadas al nodo eliminado
                const aristasEliminadas = aristas.get({
                    filter: function (arista) {
                        return arista.from === nodoEliminado || arista.to === nodoEliminado;
                    }
                });
                aristas.remove(aristasEliminadas);
            }
        });
    }
    
    

    

    function agregarNodoAlArbol(valorNodo) {
        ultimoIdNodo++;
        const nuevoNodoId = ultimoIdNodo;
        let posicionNodo = {x: 0, y: 0};
        
        // Buscar posición para el nuevo nodo
        let nodoPadreId = buscarNodoPadre(1, valorNodo); // Empezar búsqueda desde el nodo raíz
    
        if(nodoPadreId !== null) {
            const nodoPadre = nodos.get(nodoPadreId);
            let direccion = valorNodo < nodoPadre.value ? -1 : 1; // Izquierda o derecha
            
            // Calcular el nivel del nuevo nodo
            const nivelPadre = obtenerNivel(nodoPadreId);
            const nivelNuevoNodo = nivelPadre + 1;
    
            // Ajustar la posición vertical basada en el nivel del nodo
            posicionNodo.x = nodoPadre.x + (150 * direccion); // Separación horizontal ajustable
            posicionNodo.y = nivelNuevoNodo * 100; // Separación vertical ajustable
            
            nodos.add({id: nuevoNodoId, label: `${valorNodo}`, value: valorNodo, x: posicionNodo.x, y: posicionNodo.y, fixed: false, physics: false});
            aristas.add({from: nodoPadreId, to: nuevoNodoId});
        } else {
            console.log("No se encontró un lugar para el nodo. Esto no debería ocurrir en un árbol binario.");
        }
    }
    
    
    function obtenerNivel(nodoId) {
        let nivel = 0;
        let padreId = nodoId;
        
        while (padreId !== 1) { // Iterar hacia arriba hasta llegar al nodo raíz
            const arista = aristas.get({
                filter: function(item) {
                    return item.to === padreId;
                }
            })[0]; // Obtener la arista que conecta al nodo padre
            padreId = arista.from; // Obtener el ID del nodo padre
            
            nivel++; // Incrementar el nivel
        }
        
        return nivel;
    }

    function buscarNodoPadre(nodoActualId, valorNodo) {
        const nodoActual = nodos.get(nodoActualId);
        const hijos = aristas.get({
            filter: function (arista) {
                return arista.from === nodoActualId;
            }
        });
    
        // Determinar si el nodo debe ir a la izquierda o derecha
        if(valorNodo < nodoActual.value) {
            // Buscar a la izquierda
            const hijoIzquierdo = hijos.find(hijo => nodos.get(hijo.to).value < nodoActual.value);
            if(hijoIzquierdo) {
                return buscarNodoPadre(hijoIzquierdo.to, valorNodo);
            } else {
                return nodoActualId;
            }
        } else {
            // Buscar a la derecha
            const hijoDerecho = hijos.find(hijo => nodos.get(hijo.to).value >= nodoActual.value);
            if(hijoDerecho) {
                return buscarNodoPadre(hijoDerecho.to, valorNodo);
            } else {
                // Si no hay nodo hijo a la derecha, se verifica si hay un nodo eliminado en esa rama
                const nodoHermanoDerecho = nodos.get({
                    filter: function (nodo) {
                        return nodo.x > nodoActual.x && nodo.y === nodoActual.y;
                    }
                })[0];
                if (nodoHermanoDerecho && nodoHermanoDerecho.value < valorNodo) {
                    return buscarNodoPadre(nodoHermanoDerecho.id, valorNodo);
                } else {
                    return nodoActualId;
                }
            }
        }
    }


    function aristaDuplicada(origen, destino) { // Verificar si no existe ya una arista en la misma dirección al mismo nodo
        const aristasExistentes = aristas.get({
            filter: function(item) {
                return (item.from === origen && item.to === destino);
            }
        });
        return aristasExistentes.length > 0;
    }

    function loopExistente(nodo) { // Verificar si no hay arista loop en el mismo nodo
        const loops = aristas.get({
            filter: function(item) {
                return item.from === nodo && item.to === nodo;
            }
        });
        return loops.length > 0;
    }

    function comprobarVisibilidadMatriz() { // Comprobar si la matriz está vacía o no
        matrizContainer.style.display = nodos.length === 0 && aristas.length === 0 ? 'none' : 'block';
    }

    function actualizarMatriz() { // Actualización de datos en la matriz
        const nodosArray = nodos.get().map(nodo => nodo.id);
        let matriz = {};

        nodosArray.forEach(nodoId => {
            matriz[nodoId] = nodosArray.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
        });

        aristas.get().forEach(arista => {
            const valor = arista.label ? parseInt(arista.label, 10) : 0;
            if (matriz[arista.from] && matriz[arista.from][arista.to] !== undefined) { // Asegura que ambos nodos existan
                matriz[arista.from][arista.to] = isNaN(valor) ? 0 : valor;
            }
        });

        generarHTMLMatriz(matriz, nodosArray);
    }

    function generarHTMLMatriz(matriz, nodosIds) { // Generar HTML de la matriz según datos
        const nodosLabels = nodosIds.map(id => nodos.get(id).label);
        matrizHeader.innerHTML = '<th></th>' + nodosLabels.map(label => `<th>${label}</th>`).join('') + '<th>Suma</th>';
        matrizBody.innerHTML = nodosIds.map(id => {
            const fila = nodosIds.map(idInterno => matriz[id][idInterno]).join('</td><td>');
            const sumaFila = nodosIds.reduce((acc, idInterno) => acc + matriz[id][idInterno], 0);
            return `<tr><th>${nodos.get(id).label}</th><td>${fila}</td><td>${sumaFila}</td></tr>`;
        }).join('');

        const sumaColumna = nodosIds.map(idInterno => nodosIds.reduce((acc, id) => acc + matriz[id][idInterno], 0));
        const total = sumaColumna.reduce((acc, val) => acc + val, 0);
        matrizBody.innerHTML += `<tr><th>Suma</th>${sumaColumna.map(suma => `<td>${suma}</td>`).join('')}<td>${total}</td></tr>`;
    }

    function exportarComoPNG(nombreArchivo) { // Exportar imagen del grafo
        html2canvas(grafoContainer).then(canvas => {
            let enlace = document.createElement('a');
            enlace.download = nombreArchivo || 'grafo.png';
            enlace.href = canvas.toDataURL('image/png');
            enlace.click();
            enlace.remove();
        });
    }

    async function exportarComoPDF(nombreArchivo) { // Exportar PDF del grafo
        const canvas = await html2canvas(grafoContainer);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'landscape',
        });
        pdf.addImage(imgData, 'PNG', 10, 10);
        pdf.save(nombreArchivo || 'grafo.pdf');
    }

    function exportarGrafo(nombreArchivo) {
        try {
            const datosExportar = {
                nodos: nodos.get({ returnType: "Object" }),
                aristas: aristas.get()
            };
            const datosStr = JSON.stringify(datosExportar);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(datosStr);
    
            let exportarLink = document.createElement('a');
            exportarLink.setAttribute('href', dataUri);
            exportarLink.setAttribute('download', nombreArchivo || 'grafo.json');
            document.body.appendChild(exportarLink);
    
            exportarLink.click();
            document.body.removeChild(exportarLink);
        } catch (error) {
            console.error('Error al exportar el grafo como JSON:', error);
        }
    }

    function importarGrafo(event) { 
        const archivo = event.target.files[0];
        if (!archivo) {
            return;
        }
    
        const reader = new FileReader();
        reader.onload = function(fileEvent) {
            try {
                const datos = JSON.parse(fileEvent.target.result);
                nodos.clear();
                aristas.clear();
                nodos.add(Object.values(datos.nodos)); // Agrega nodos manteniendo posiciones
                aristas.add(datos.aristas);
                // No olvides volver a inicializar la red de visualización si es necesario
                // network = new vis.Network(grafoContainer, { nodes: nodos, edges: aristas }, opciones);
                ultimoIdNodo = Math.max(...Object.values(datos.nodos).map(nodo => nodo.id));

            } catch (error) {
                console.error('Error al importar el archivo', error);
            }
        };
        reader.readAsText(archivo);
    }

    function limpiarGrafo() {
    nodos.clear(); // Limpiar nodos
    aristas.clear(); // Limpiar aristas
    // También puedes limpiar la visualización de la red si es necesario
    // network.destroy();
}

    guardarBtn.addEventListener('click', function() { // Se apreta el botón de exportar
        exportOptions.style.display = 'block';
    });

    exportPNG.addEventListener('click', function() { // Se apreta el botón de exportar como PNG
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.png");
        exportarComoPNG(nombreArchivo);
        exportOptions.style.display = 'none';
    });

    exportPDF.addEventListener('click', function() { // Se apreta el botón de exportar como PDF
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.pdf");
        exportarComoPDF(nombreArchivo);
        exportOptions.style.display = 'none';
    });

    exportJSON.addEventListener('click', function() { // Se apreta el botón de exportar como JSON (editable)
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.json");
        exportarGrafo(nombreArchivo);
        exportOptions.style.display = 'none';
    });

    cargarBtn.addEventListener('click', () => importarArchivo.click()); // Se apreta el botón de importar
    importarArchivo.addEventListener('change', importarGrafo);

    document.getElementById('eliminarBtn').addEventListener('click', function() {
        // Al hacer clic en el botón de eliminar, cambia el modoEliminar a su estado opuesto
        modoEliminar = !modoEliminar;
        if (modoEliminar) {
            // Si estamos activando el modo eliminar, cambia el cursor para indicar que estamos en modo eliminar
            grafoContainer.style.cursor = 'crosshair';
        } else {
            // Si estamos desactivando el modo eliminar, restaura el cursor predeterminado
            grafoContainer.style.cursor = '';
        }
    });

    document.getElementById('cambiarColorBtn').addEventListener('input', function(event) { // Cambiar color de nodos 
        estado.colorActual = event.target.value;
    });

    document.getElementById('limpiarBtn').addEventListener('click', function() { // Limpiar grafo completo y actualizar matriz
        location.reload();
    });

    inicializarRed();
});