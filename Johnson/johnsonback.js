document.addEventListener('DOMContentLoaded', function() {
    const grafoContainer = document.getElementById('grafo-container');
    const matrizContainer = document.getElementById('matriz-container');
    const matrizHeader = document.getElementById('matriz-header');
    const matrizBody = document.getElementById('matriz-body');
    const exportarBtn = document.getElementById('exportarBtn');
    const importarBtn = document.getElementById('importarBtn');
    const importarArchivo = document.getElementById('importarArchivo');
    const colorPicker = document.getElementById('cambiarColorBtn');
    let nodos = new vis.DataSet();
    let aristas = new vis.DataSet();
    let network = null;
    let estado = { seleccionando: false, nodoOrigen: null, colorActual: '#d2e5ff', modoEliminar: false };
    let ultimoIdNodo = 0; // Mantener el control del último ID de nodo utilizado

    const opciones = { //Opciones de grafo
        nodes: {
            shape: 'circle',
            font: {
                size: 14,
                color: '#ffffff',
                multi: true
            },
            borderWidth: 2,
            scaling: {
                min: 16,
                max: 32,
                label: {
                    enabled: true,
                    min: 14,
                    max: 30,
                    drawThreshold: 8,
                    maxVisible: 20
                }
            }
        },
        edges: {
            arrows: 'to',
            selfReferenceSize: 20,
            selfReference: {
                angle: Math.PI / 4
            },
            font: {
                align: 'middle'
            }
        },
        physics: {
            enabled: true
        },
        interaction: {
            dragNodes: true
        }
    };

    function inicializarRed() {
        const datos = {
            nodes: nodos,
            edges: aristas
        };
        network = new vis.Network(grafoContainer, datos, opciones);

        network.on("click", function(params) { // Entrar al modo eliminar
            if (estado.modoEliminar) {
                const nodeId = this.getNodeAt(params.pointer.DOM);
                const edgeId = this.getEdgeAt(params.pointer.DOM);
                if (nodeId) {
                    nodos.remove({id: nodeId});
                    const aristasAsociadas = aristas.get({
                        filter: function(arista) {
                            return arista.from === nodeId || arista.to === nodeId;
                        }
                    });
                    aristas.remove(aristasAsociadas);
                } else if (edgeId) {
                    aristas.remove({id: edgeId});
                }
                return;
            }

            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                if (estado.seleccionando) { // Verificación de nodo seleccionado
                    const nodoOrigen = estado.nodoOrigen;
                    const nodoDestino = nodeId;
                    if (nodoOrigen !== nodoDestino && !aristaDuplicada(nodoOrigen, nodoDestino)) { // Acción para creación arista ida o vuelta
                        let atributoArista;
                        do {
                            atributoArista = prompt("Ingrese el atributo de la arista (ej. peso):", "");
                            if (atributoArista === null) break; // El usuario canceló el prompt
                        } while (isNaN(atributoArista) || atributoArista.trim() === ""); // Repetir mientras la entrada no sea un número o esté vacía
                    
                        if (atributoArista !== null) { // Verificar nuevamente por si el usuario canceló el prompt
                            aristas.add({
                                from: nodoOrigen,
                                to: nodoDestino,
                                label: atributoArista
                            });
                        }
                    } else if(nodoOrigen === nodoDestino && !loopExistente(nodoOrigen)) { // Acción para creación arista loop
                        let atributoArista;
                        do {
                            atributoArista = prompt("Ingrese el atributo de la arista (loop):", "");
                            if (atributoArista === null) break; // El usuario canceló el prompt
                        } while (isNaN(atributoArista) || atributoArista.trim() === ""); // Repetir mientras la entrada no sea un número o esté vacía
                    
                        if (atributoArista !== null) { // Verificar nuevamente por si el usuario canceló el prompt
                            aristas.add({
                                from: nodoOrigen,
                                to: nodoDestino,
                                label: atributoArista
                            });
                        }
                    }                    
                    estado.seleccionando = false;
                    estado.nodoOrigen = null;
                } else {
                    estado.seleccionando = true;
                    estado.nodoOrigen = nodeId;
                }
            } else { // Si no hay nodo para seleccionar
                const coordenadas = params.pointer.canvas;
                const nombreNodo = prompt("Ingrese el nombre del nodo:", `Nodo ${ultimoIdNodo + 1}`);
                if (nombreNodo !== null) {
                    crearNodo(coordenadas.x, coordenadas.y, estado.colorActual, nombreNodo);
                }
            }
        });

        network.on("oncontext", function(params) { // Cambiar nombre nodo o arista con click derecho
            params.event.preventDefault();
            const nodeId = this.getNodeAt(params.pointer.DOM);
            const edgeId = this.getEdgeAt(params.pointer.DOM);

            if (nodeId !== undefined) {
                const nuevoNombre = prompt("Ingrese el nuevo nombre del nodo:", "");
                if (nuevoNombre !== null) {
                    nodos.update({id: nodeId, label: nuevoNombre});
                }
            } else if (edgeId !== undefined) {
                const nuevoAtributo = prompt("Ingrese el nuevo atributo de la arista:", "");
                if (nuevoAtributo !== null) {
                    aristas.update({id: edgeId, label: nuevoAtributo});
                }
            }
        });

        nodos.on("*", function() { // Verificar acciones sobre nodo
            actualizarMatriz();
            comprobarVisibilidadMatriz();
        });
        aristas.on("*", function() { // Verificar acciones sobre aristas
            actualizarMatriz();
            comprobarVisibilidadMatriz();
        });
    }

    function crearNodo(x, y, color, nombre) { //Crear nodo
        ultimoIdNodo++; // Incrementar el ID del último nodo para asegurar que sea único
        nodos.add({
            id: ultimoIdNodo,
            label: nombre,
            x: x,
            y: y,
            color: color,
            physics: false
        });
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