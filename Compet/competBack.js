document.addEventListener('DOMContentLoaded', function() {
    const grafoContainer = document.getElementById('grafo-container');
    const exportarBtn = document.getElementById('exportarBtn');
    const importarBtn = document.getElementById('importarBtn');
    const importarArchivo = document.getElementById('importarArchivo');
    const colorPicker = document.getElementById('cambiarColorBtn');
    let nodos = new vis.DataSet();
    let aristas = new vis.DataSet();
    let network = null;
    let estado = { seleccionando: false, nodoOrigen: null, colorActual: '#d2e5ff', modoEliminar: false };
    let ultimoIdNodo = 0;

    const opciones = {
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
            arrows: { to: false },
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
    
        network.on("click", function(params) {
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
                if (estado.seleccionando) {
                    const nodoOrigen = estado.nodoOrigen;
                    const nodoDestino = nodeId;
                    if (nodoOrigen !== nodoDestino && !aristaDuplicada(nodoOrigen, nodoDestino)) {
                        // Calcular centro entre nodos
                        const nodoOrigenData = nodos.get(nodoOrigen);
                        const nodoDestinoData = nodos.get(nodoDestino);
                        const centroX = (parseFloat(nodoOrigenData.coordX) + parseFloat(nodoDestinoData.coordX)) / 2;
                        const centroY = (parseFloat(nodoOrigenData.coordY) + parseFloat(nodoDestinoData.coordY)) / 2;
                        
                        // Crear arista
                        aristas.add({
                            from: nodoOrigen,
                            to: nodoDestino,
                            label: `Centro (${centroX}, ${centroY})`
                        });
                        
                        // Calcular centroide
                        const numNodos = nodos.length;
                        let sumX = 0;
                        let sumY = 0;
                        nodos.forEach(nodo => {
                            sumX += parseFloat(nodo.coordX);
                            sumY += parseFloat(nodo.coordY);
                        });
                        const centroidX = sumX / numNodos;
                        const centroidY = sumY / numNodos;
                        console.log(`Centroide: (${centroidX}, ${centroidY})`);
                    }
                    estado.seleccionando = false;
                    estado.nodoOrigen = null;
                } else {
                    estado.seleccionando = true;
                    estado.nodoOrigen = nodeId;
                }
            } else {
                const coordenadas = params.pointer.canvas;
                const nombreNodo = prompt("Ingrese el nombre del nodo:", `Nodo ${ultimoIdNodo + 1}`);
                if (nombreNodo !== null) {
                    const coordX = prompt("Ingrese la coordenada X del nodo:", "0");
                    const coordY = prompt("Ingrese la coordenada Y del nodo:", "0");
                    // Verificar si ya existe un nodo en estas coordenadas
                    const nodoExistente = nodos.get({
                        filter: function(nodo) {
                            return nodo.coordX === coordX && nodo.coordY === coordY;
                        }
                    });
                    if (nodoExistente.length > 0) {
                        alert("Ya existe un nodo en estas coordenadas. Por favor, elige un lugar diferente.");
                        return;
                    }
                    crearNodo(coordenadas.x, coordenadas.y, estado.colorActual, nombreNodo, coordX, coordY);
                } else {
                    alert("Coordenadas inválidas. El nodo no será creado.");
                }
            }
        });
    
        network.on("oncontext", function(params) {
            params.event.preventDefault();
            const nodeId = this.getNodeAt(params.pointer.DOM);
            const edgeId = this.getEdgeAt(params.pointer.DOM);
    
            if (nodeId !== undefined) {
                const nuevoNombre = prompt("Ingrese el nuevo nombre del nodo:", "");
                if (nuevoNombre !== null) {
                    const nodo = nodos.get(nodeId);
                    nodos.update({id: nodeId, label: `${nuevoNombre} (${nodo.x}, ${nodo.y})`});
                }
            } else if (edgeId !== undefined) {
                const nuevoAtributo = prompt("Ingrese el nuevo atributo de la arista:", "");
                if (nuevoAtributo !== null) {
                    aristas.update({id: edgeId, label: nuevoAtributo});
                }
            }
        });
    }
    
    document.getElementById('resolverBtn').addEventListener('click', function() {
        // Verificar si hay nodos en la red
        if (nodos.length === 0) {
            alert("No hay nodos en la red para calcular el centroide.");
            return;
        }
    
        // Verificar si todos los nodos tienen al menos dos conexiones
        const nodosValidos = nodos.getIds().filter(nodeId => {
            const conexiones = aristas.get({
                filter: function(arista) {
                    return arista.from === nodeId || arista.to === nodeId;
                }
            });
            return conexiones.length >= 2;
        });
    
        if (nodosValidos.length !== nodos.length) {
            alert("Se necesita un sistema cerrado de nodos para resolver el ejercicio.");
            return;
        }
    
        // Calcular el promedio de las coordenadas X y Y de todos los nodos
        let sumCoordX = 0;
        let sumCoordY = 0;
        nodos.forEach(nodo => {
            sumCoordX += parseFloat(nodo.coordX);
            sumCoordY += parseFloat(nodo.coordY);
        });
        const centroidCoordX = sumCoordX / nodos.length;
        const centroidCoordY = sumCoordY / nodos.length;
    
        // Obtener las dimensiones del contenedor
        const containerWidth = grafoContainer.offsetWidth;
        const containerHeight = grafoContainer.offsetHeight;
    
        // Calcular las coordenadas del centroide en relación con el contenedor
        const centroideX = containerWidth / 220;
        const centroideY = containerHeight / 220;
    
        // Crear nodo para el centroide
        const centroideNode = {
            id: 'centroide',
            label: `Centroide (${centroidCoordX.toFixed(2)}, ${centroidCoordY.toFixed(2)})`,
            x: centroideX,
            y: centroideY,
            color: {
                background: 'red',
                border: 'black'
            },
            shape: 'dot',
            size: 20
        };
    
        // Agregar nodo del centroide a la red
        nodos.add(centroideNode);
    });
    
    
    

    function crearNodo(x, y, color, nombre, coordX, coordY) {
        ultimoIdNodo++;
        nodos.add({
            id: ultimoIdNodo,
            label: `${nombre} (${coordX}, ${coordY})`,
            coordX: coordX,
            coordY: coordY,
            x: x,
            y: y,
            color: color,
            physics: false
        });
    }

    function aristaDuplicada(origen, destino) {
        const aristasExistentes = aristas.get({
            filter: function(item) {
                return (item.from === origen && item.to === destino);
            }
        });
        return aristasExistentes.length > 0;
    }

    function exportarComoPNG(nombreArchivo) {
        html2canvas(grafoContainer).then(canvas => {
            let enlace = document.createElement('a');
            enlace.download = nombreArchivo || 'grafo.png';
            enlace.href = canvas.toDataURL('image/png');
            enlace.click();
            enlace.remove();
        });
    }

    async function exportarComoPDF(nombreArchivo) {
        const canvas = await html2canvas(grafoContainer);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'landscape',
        });
        pdf.addImage(imgData, 'PNG', 10, 10);
        pdf.save(nombreArchivo || 'grafo.pdf');
    }

    function exportarGrafo(nombreArchivo) {
        const datosExportar = {
            nodos: nodos.get({ returnType: "Object" }),
            aristas: aristas.get(),
            estado: estado
        };
        const datosStr = JSON.stringify(datosExportar);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(datosStr);
        
        let exportarLink = document.createElement('a');
        exportarLink.setAttribute('href', dataUri);
        exportarLink.setAttribute('download', nombreArchivo || 'grafo.json');
        document.body.appendChild(exportarLink);
        
        exportarLink.click();
        document.body.removeChild(exportarLink);
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
                nodos.add(Object.values(datos.nodos));
                aristas.add(datos.aristas);
                estado = datos.estado;
                colorPicker.value = estado.colorActual;
                ultimoIdNodo = Math.max(...Object.values(datos.nodos).map(nodo => nodo.id));
            } catch (error) {
                console.error('Error al importar el archivo', error);
            }
        };
        reader.readAsText(archivo);
    }

    guardarBtn.addEventListener('click', function() {
        exportOptions.style.display = 'block';
    });

    exportPNG.addEventListener('click', function() {
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.png");
        exportarComoPNG(nombreArchivo);
        exportOptions.style.display = 'none';
    });

    exportPDF.addEventListener('click', function() {
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.pdf");
        exportarComoPDF(nombreArchivo);
        exportOptions.style.display = 'none';
    });

    exportJSON.addEventListener('click', function() {
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.json");
        exportarGrafo(nombreArchivo);
        exportOptions.style.display = 'none';
    });

    cargarBtn.addEventListener('click', () => importarArchivo.click());
    importarArchivo.addEventListener('change', importarGrafo);

    document.getElementById('eliminarBtn').addEventListener('click', function() {
        estado.modoEliminar = !estado.modoEliminar;
        grafoContainer.style.cursor = estado.modoEliminar ? 'crosshair' : '';
    });

    document.getElementById('cambiarColorBtn').addEventListener('input', function(event) {
        estado.colorActual = event.target.value;
    });

    document.getElementById('limpiarBtn').addEventListener('click', function() {
        nodos.clear();
        aristas.clear();
        estado = { seleccionando: false, nodoOrigen: null, colorActual: estado.colorActual, modoEliminar: false };
        ultimoIdNodo = 0;
    });

    inicializarRed();
});
