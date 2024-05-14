document.addEventListener('DOMContentLoaded', function() {
    var graph = new joint.dia.Graph();
    var paper = new joint.dia.Paper({
        el: document.getElementById('graficoContainer'),
        model: graph,
        width: 800,
        height: 430,
        gridSize: 1,
        background: {
            color: 'rgba(0, 0, 0, 0.4)'
        },
        interactive: function(cellView) {
            // Verifica si el modo de edición está activo o no
            if (modoEdicion) {
                return { vertexAdd: false, labelMove: true };
            } else {
                return false; // Desactiva todas las interacciones
            }
        },
        defaultLink: new joint.shapes.standard.Link({
            attrs: {
                line: {
                    stroke: document.getElementById('cambiarColorAristaBtn').value,
                    strokeWidth: 4,
                    targetMarker: {
                        'type': 'path',
                        'd': 'M 10 -10 0 0 10 10 Z', // Coordenadas ajustadas para un triángulo más grande
                        'fill': document.getElementById('cambiarColorAristaBtn').value,
                        'stroke': 'none'
                    }
                }
            }
        }),       
        validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
            // Verifica si el origen y el destino son los mismos nodos
            if (cellViewS === cellViewT) return false;
        
            // Verifica si ya existe un enlace entre los nodos
            var links = graph.getConnectedLinks(cellViewS.model);
            for (var i = 0; i < links.length; i++) {
                if (links[i].getTargetElement() === cellViewT.model || links[i].getSourceElement() === cellViewT.model) {
                    return false;
                }
            }
            return magnetT;
        },
        validateMagnet: function(cellView, magnet) {
            // Adjust cursor and enable linking when on the magnet (border)
            if (magnet.getAttribute('magnet') === 'passive') {
                return false;
            } else {
                return true;
            }
        },
        snapLinks: { radius: 75 },
        linkPinning: false,
        markAvailable: true
    });

    // Variable para rastrear el estado del modo de edición
    var modoEdicion = false; // Por defecto, el modo de edición está activado

    // Función para cambiar el estado del modo de edición
    function cambiarModoEdicion() {
        modoEdicion = !modoEdicion; // Cambia el estado del modo de edición
        // Actualiza las interacciones del papel
        paper.setInteractivity(function(cellView) {
            if (modoEdicion) {
                return { vertexAdd: false, labelMove: true };
            } else {
                return false;
            }
        });
    }

    function createNode(x, y, label) {
        var colorNodo = document.getElementById('cambiarColorBtn').value;
        var colorTexto = document.getElementById('cambiarColorTextoBtn').value;
        var nodeSize = Math.max(30, label.length * 10);

        var cell = new joint.shapes.standard.Circle({
            position: { x: x - nodeSize / 2, y: y - nodeSize / 2 },
            size: { width: nodeSize, height: nodeSize },
            attrs: {
                body: {
                    fill: colorNodo,
                    stroke: 'black',
                    strokeWidth: 4,
                    magnet: true
                },
                label: {
                    text: label,
                    fill: colorTexto,
                    fontSize: 12,
                    textVerticalAnchor: 'middle',
                    textHorizontalAnchor: 'middle'
                }
            }
        });
        graph.addCell(cell);
        return cell;
    }

    paper.on('blank:pointerdown', function(evt, x, y) {
        // Verifica si el modo de edición está activado
        if (modoEdicion) {
            var nodeName = prompt("Ingrese el nombre del nodo:");
            if (nodeName) {
                createNode(x, y, nodeName);
            }
        }
    });

    paper.on('link:connect', function(linkView) {
        var attribute = prompt('Ingrese el atributo numérico para la arista:');
        if (attribute && !isNaN(parseFloat(attribute)) && isFinite(attribute)) {
            // Solo si el valor es numérico se establece la etiqueta
            linkView.model.label(0, { 
                attrs: { 
                    text: { 
                        text: attribute,
                        fontWeight: 'bold',
                        fill: document.getElementById('cambiarColorTextoBtn').value, 
                        fontSize: 16,
                        textBackground: 'none',
                        strokeWidth: 0.25,
                        stroke: 'white'
                    },
                    rect: {
                        fill: 'none',
                        stroke: 'none'
                    }
                } 
            });
        } else {
            alert('El atributo debe ser un número.');
            linkView.model.remove(); // Remueve la arista si el atributo no es numérico
        }
    });    

    // Añadir evento contextmenu para nodos
    paper.on('element:contextmenu', function(elementView, evt) {
        evt.preventDefault(); // Previene el menú contextual predeterminado
        if (modoEdicion) {
            const newName = prompt("Ingrese el nuevo nombre del nodo:");
            if (newName) {
                elementView.model.attr('label/text', newName); // Actualiza el nombre del nodo
                var nodeSize = Math.max(30, newName.length * 10); // Calcula el nuevo tamaño
                elementView.model.resize(nodeSize, nodeSize); // Actualiza el tamaño del nodo
                elementView.model.attr('body/refWidth', '100%'); // Asegura que el cuerpo se ajuste al tamaño del texto
                elementView.model.attr('body/refHeight', '100%');
            }
        }
    });

    // Añadir evento contextmenu para aristas
    paper.on('link:contextmenu', function(linkView, evt) {
        evt.preventDefault(); // Previene el menú contextual predeterminado
        if (modoEdicion) {
            let newValue = prompt("Ingrese el nuevo valor para el atributo de la arista (solo números):");
            if (newValue && !isNaN(newValue)) { // Verifica que el valor sea numérico
                linkView.model.label(0, { attrs: { text: { text: newValue } } }); // Actualiza el atributo de la arista
            } else if (newValue) {
                alert("Por favor, ingrese solo valores numéricos.");
            }
        }
    });

    // Maneja el cambio de modo de edición cuando se hace clic en el interruptor
    document.querySelector('input[type="checkbox"]').addEventListener('change', cambiarModoEdicion);

    // Evento de clic para el botón "Borrar Solución"
    document.getElementById('volverColorOrig').addEventListener('click', function() {
        // Llamar a la función para restaurar los colores originales de las aristas
        restaurarColoresOriginales();
        // Limpiar el contenido del contenedor 'resultado-container'
        document.getElementById('resultado-container').innerText = '';
    });

    // Función para restaurar los colores originales de las aristas y nodos
    function restaurarColoresOriginales() {
        // Restaurar aristas a su color original
        var edges = graph.getLinks();
        var defaultAristaColor = document.getElementById('cambiarColorAristaBtn').value;
        edges.forEach(edge => {
            edge.attr({
                line: {
                    stroke: defaultAristaColor,
                    strokeWidth: 4,
                    targetMarker: {
                        type: 'path',
                        d: 'M 10 -10 0 0 10 10 Z',
                        fill: defaultAristaColor,
                        stroke: 'none'
                    }
                }
            });
        });

        // Restaurar nodos a su color original
        var nodes = graph.getElements();
        var defaultNodoColor = document.getElementById('cambiarColorBtn').value;
        nodes.forEach(node => {
            node.attr({
                body: {
                    fill: defaultNodoColor,
                    stroke: 'black',
                    strokeWidth: 4
                },
                label: {
                    fill: document.getElementById('cambiarColorTextoBtn').value
                }
            });
        });
    }

    document.getElementById('guardarBtn').addEventListener('click', function() {
        var nombreArchivo = prompt("Ingrese el nombre del archivo:");
        if (nombreArchivo) {
            var jsonData = JSON.stringify(graph.toJSON());
            var blob = new Blob([jsonData], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo + '.json'; // Agrega la extensión .json al nombre del archivo
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert("Por favor, ingrese un nombre válido para el archivo.");
        }
    });    
    
    modoEliminar = false;

    document.getElementById('eliminarBtn').addEventListener('click', function() {
        // Cambia entre modo de eliminar y modo de edición cada vez que se presiona el botón.
        modoEliminar = !modoEliminar; // Alternar el estado de modoEliminar
        paper.el.style.cursor = modoEliminar ? 'crosshair' : 'default'; // Cambia el cursor según el modo
        if (modoEliminar && !modoEdicion) {
            alert('Debes activar el modo de edición para eliminar.');
            modoEliminar = false; // Desactiva el modo eliminar si el modo edición no está activo.
            paper.el.style.cursor = 'default';
        }
    });
    
    paper.on('element:pointerclick', function(elementView) {
        if (modoEliminar && modoEdicion) {
            graph.removeCells([elementView.model]); // Elimina el nodo seleccionado
        }
    });
    
    paper.on('link:pointerclick', function(linkView) {
        if (modoEliminar && modoEdicion) {
            graph.removeCells([linkView.model]); // Elimina la arista seleccionada
        }
    });    

    document.getElementById('cargarBtn').addEventListener('click', function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(e) {
                var jsonData = e.target.result;
                graph.fromJSON(JSON.parse(jsonData)); // Carga el gráfico desde el JSON leído
            };
            reader.readAsText(file);
        };
        input.click(); // Abre el diálogo de selección de archivos
    });    

    document.getElementById('limpiarBtn').addEventListener('click', function() {
        graph.resetCells(); // Elimina todos los elementos del gráfico
    });    

    document.getElementById('solMinBtn').addEventListener('click', function() {
        restaurarColoresOriginales();
        if (!modoEdicion) {
            var nombreOrigen = prompt("Ingrese el nombre del nodo de origen:");
            var nombreDestino = prompt("Ingrese el nombre del nodo de destino:");
            
            var nodoOrigen = findNodeByName(nombreOrigen);
            var nodoDestino = findNodeByName(nombreDestino);
    
            if (!nodoOrigen || !nodoDestino) {
                alert("Uno o ambos nombres de nodos no existen. Por favor, verifique los nombres e intente de nuevo.");
                return;
            }
    
            if (nodoOrigen.id === nodoDestino.id) {
                alert("Los nodos origen y destino deben ser diferentes.");
                return;
            }
    
            var path = dijkstra(graph, nodoOrigen.id, nodoDestino.id);
            if (!path || path.length === 0) {
                alert("No se encontró un camino válido entre los nodos seleccionados.");
                if (nodoOrigen && nodoDestino) {
                    markNodeAsError(nodoOrigen);
                    markNodeAsError(nodoDestino);
                }
            } else {
                highlightPath(path);
            }
        } else {
            alert("Por favor, desactive el modo de edición para usar esta función.");
        }
    });
    
    function findNodeByName(nodeName) {
        var nodes = graph.getElements();
        return nodes.find(node => node.attr('label/text') === nodeName);
    }
    
    function markNodeAsError(node) {
        node.attr('body/fill', 'red');
    }
    
    function highlightPath(path) {
        for (let i = 0; i < path.length - 1; i++) {
            const nodeId = path[i];
            const nextNodeId = path[i + 1];
    
            // Encuentra el nodo y cámbiale el color
            const node = graph.getCell(nodeId);
            if (node) {
                node.attr('body', { fill: 'lightgreen' });
            }
    
            // Encuentra la arista entre este nodo y el próximo y cámbiale el color
            const link = findLinkBetweenNodes(graph.getLinks(), nodeId, nextNodeId);
            if (link) {
                link.attr({
                    line: {
                        stroke: 'green',
                        strokeWidth: 4,
                        targetMarker: {
                            type: 'path',
                            d: 'M 10 -10 0 0 10 10 Z', // Ajusta las coordenadas si es necesario
                            fill: 'green', // Asegúrate de que el relleno del triángulo coincida con el color de la línea
                            stroke: 'none'
                        }
                    }
                });
            }
        }
    
        // No te olvides de colorear el último nodo
        const lastNode = graph.getCell(path[path.length - 1]);
        if (lastNode) {
            lastNode.attr('body', { fill: 'lightgreen' });
        }
    }     
    
    function dijkstra(graph, sourceId, targetId) {
        var elements = graph.getElements();
        var links = graph.getLinks();
        var nodes = {};
        var dist = {};
        var prev = {};
        var pq = new PriorityQueue();
    
        elements.forEach(function(element) {
            var id = element.id;
            nodes[id] = element;
            dist[id] = Infinity;
            prev[id] = null;
        });
    
        if (!nodes[sourceId] || !nodes[targetId]) {
            console.error("Uno o ambos nodos no existen en el gráfico.");
            return null;
        }
    
        dist[sourceId] = 0;
        pq.enqueue(sourceId, dist[sourceId]);
    
        while (!pq.isEmpty()) {
            var u = pq.dequeue();
    
            if (u === targetId) break;
    
            var uDist = dist[u];
            var neighbors = graph.getNeighbors(nodes[u], { outbound: true });
    
            neighbors.forEach(function(v) {
                var link = findLinkBetweenNodes(links, u, v.id);
                if (link) {
                    var attribute = link.attributes.labels[0].attrs.text.text || "0";
                    var alt = uDist + parseInt(attribute, 10);
                    if (alt < dist[v.id]) {
                        dist[v.id] = alt;
                        prev[v.id] = u;
                        pq.enqueue(v.id, alt);
                    }
                }
            });
        }
    
        var path = [];
        for (var at = targetId; at !== null; at = prev[at]) {
            path.push(at);
        }
        path.reverse();
    
        return (dist[targetId] === Infinity) ? null : path;
    }
    
    function findLinkBetweenNodes(links, sourceId, targetId) {
        return links.find(link => link.source().id === sourceId && link.target().id === targetId);
    }
    
       
    class PriorityQueue {
        constructor() {
            this.elements = [];
        }
    
        enqueue(id, priority) {
            let placed = false;
            for (let i = 0; i < this.elements.length; i++) {
                if (this.elements[i].priority > priority) {
                    this.elements.splice(i, 0, { id, priority });
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                this.elements.push({ id, priority });
            }
        }
    
        dequeue() {
            return this.elements.shift().id;
        }
    
        isEmpty() {
            return this.elements.length === 0;
        }
    }    
});
