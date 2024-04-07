document.addEventListener('DOMContentLoaded', function() {
    const grafoContainer = document.getElementById('grafo-container');
    let nodos = new vis.DataSet([{id: 1, label: 'Nodo 1', value: 6, x: -150, y: 0, fixed: true, physics: false}]); // Inicializa con nodo raíz
    let aristas = new vis.DataSet();
    let network = null;
    let ultimoIdNodo = 1;

    const opciones = {
        nodes: {
            shape: 'circle',
            size: 14,
            font: {
                color: '#ffffff'
            },
            borderWidth: 2
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
        physics: false // Deshabilitar la física para mantener la estructura del árbol
    };

    function inicializarRed() {
        network = new vis.Network(grafoContainer, {nodes: nodos, edges: aristas}, opciones);

        network.on("click", function(params) {
            const nombreNodo = prompt("Ingrese el valor del nodo:", "");
            if (nombreNodo !== null) {
                agregarNodoAlArbol(parseInt(nombreNodo, 10));
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

            posicionNodo.x = nodoPadre.x + (100 * direccion); // Ajustar posición x basada en la dirección
            posicionNodo.y = nodoPadre.y + 100; // Ajustar posición y para bajar al siguiente nivel

            nodos.add({id: nuevoNodoId, label: `${valorNodo}`, value: valorNodo, x: posicionNodo.x, y: posicionNodo.y, fixed: true, physics: false});
            aristas.add({from: nodoPadreId, to: nuevoNodoId});
        } else {
            console.log("No se encontró un lugar para el nodo. Esto no debería ocurrir en un árbol binario.");
        }
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
                return nodoActualId;
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

    function exportarGrafo(nombreArchivo) { // Exportar el archivo JSON del grafo y la matriz
        const datosExportar = {
            nodos: nodos.get({ returnType: "Object" }),
            aristas: aristas.get(),
            estado: estado
        };
        const datosStr = JSON.stringify(datosExportar);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(datosStr);
        
        let exportarLink = document.createElement('a');
        exportarLink.setAttribute('href', dataUri);
        exportarLink.setAttribute('download', nombreArchivo || 'grafo.png');
        document.body.appendChild(exportarLink);
        
        exportarLink.click();
        document.body.removeChild(exportarLink);
    }

    function importarGrafo(event) { // Importar un archivo JSON de algún grafo
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
                estado = datos.estado;
                colorPicker.value = estado.colorActual;
                ultimoIdNodo = Math.max(...Object.values(datos.nodos).map(nodo => nodo.id));
                actualizarMatriz();
                comprobarVisibilidadMatriz();
            } catch (error) {
                console.error('Error al importar el archivo', error);
            }
        };
        reader.readAsText(archivo);
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

    document.getElementById('eliminarBtn').addEventListener('click', function() { // Cambia el cursor en modo eliminar
        estado.modoEliminar = !estado.modoEliminar;
        grafoContainer.style.cursor = estado.modoEliminar ? 'crosshair' : '';
    });

    document.getElementById('cambiarColorBtn').addEventListener('input', function(event) { // Cambiar color de nodos 
        estado.colorActual = event.target.value;
    });

    document.getElementById('limpiarBtn').addEventListener('click', function() { // Limpiar grafo completo y actualizar matriz
        nodos.clear();
        aristas.clear();
        estado = { seleccionando: false, nodoOrigen: null, colorActual: estado.colorActual, modoEliminar: false };
        ultimoIdNodo = 0; // Restablecer el contador de ID de nodos al limpiar
        actualizarMatriz(); // La matriz se actualiza al limpiar
        comprobarVisibilidadMatriz();
    });

    inicializarRed();
});