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
                    targetMarker: null
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
        var nodeId = label.replace(/\s+/g, '-').toLowerCase();  // Crear un ID simple basado en el label
        var colorNodo = document.getElementById('cambiarColorBtn').value;
        var colorTexto = document.getElementById('cambiarColorTextoBtn').value;
        var nodeSize = Math.max(30, label.length * 10);
    
        var cell = new joint.shapes.standard.Circle({
            id: nodeId, // Asegúrate de que este ID sea único
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
        console.log("Nodo creado con ID:", nodeId);  // Imprimir el ID para verificar
        return cell;
    }
    console.log("Nodos actuales en el grafo:", graph.getElements().map(el => el.id));

    

    paper.on('element:mouseover', function(elementView){
        paper.el.style.cursor = 'default';
    });

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
        var edges = Object.values(graph.getLinks());
        edges.forEach(edge => {
            edge.attr('line/stroke', document.getElementById('cambiarColorAristaBtn').value); // Usar el valor del botón cambiarColorAristaBtn
            edge.attr('line/strokeWidth', 4); // Opcional: restaurar el ancho original de la arista si lo deseas
        });
    });

    // Función para restaurar los colores originales de las aristas
    function restaurarColoresOriginales() {
        var edges = Object.values(graph.getLinks());
        edges.forEach(edge => {
            edge.attr('line/stroke', document.getElementById('cambiarColorAristaBtn').value); // Restaurar el color original de la arista
            edge.attr('line/strokeWidth', 4); // Opcional: restaurar el ancho original de la arista si lo deseas
        });
    }

    document.getElementById('volverColorOrig').addEventListener('click', function() {
        graph.getLinks().forEach(link => {
            link.attr('line/stroke', '#000000'); // Color predeterminado
            link.attr('line/strokeWidth', 1); // Ancho de línea predeterminado
        });
    });
 
    
    
    function reconstructPath(previous, targetId) {
        const path = [];
        let currentId = targetId;
        
        while (currentId !== null) {
            path.unshift(currentId);
            currentId = previous[currentId];
        }
    
        // Convertir los ID de los nodos en objetos de modelo de nodo
        const nodePath = path.map(nodeId => graph.getCell(nodeId));
        
        return nodePath;
    }
    
    function dijkstraAlgorithm(graph, source) {
        const distances = {};
        const previous = {};
        const queue = [];
    
        graph.getElements().forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
            queue.push(node);
        });
    
        distances[source.id] = 0;
    
        while (queue.length > 0) {
            queue.sort((a, b) => distances[a.id] - distances[b.id]);
            const current = queue.shift();
    
            graph.getConnectedLinks(current, { outbound: true }).forEach(link => {
                const target = graph.getCell(link.getTargetElement().id);
                const weight = parseFloat(link.attributes.labels[0].attrs.text.text);
                const alt = distances[current.id] + weight;
                if (alt < distances[target.id]) {
                    distances[target.id] = alt;
                    previous[target.id] = current.id;
                }
            });
        }
    
        return { distances, previous };
    }
    
    
    
    
    function highlightPaths(distances, previous) {
        // Limpiar resaltados anteriores
        graph.getLinks().forEach(link => {
            link.attr('line/stroke', document.getElementById('cambiarColorAristaBtn').value);
            link.attr('line/strokeWidth', 2);
        });
    
        graph.getElements().forEach(node => {
            node.attr('body/fill', document.getElementById('cambiarColorBtn').value);
        });
    
        const highlightedNodes = [];
    
        // Encuentra y resalta las aristas y nodos del camino más corto
        for (let nodeId in previous) {
            const sourceId = previous[nodeId];
            if (sourceId && distances[nodeId] === distances[sourceId] + getLinkWeight(graph, sourceId, nodeId)) { // Verifica la coherencia de las distancias
                const targetId = nodeId;
                const link = findLinkBetweenNodes(graph, sourceId, targetId);
                if (link) {
                    link.attr('line/stroke', 'red');
                    link.attr('line/strokeWidth', 4);
                    highlightedNodes.push(sourceId);
                    highlightedNodes.push(targetId);
                }
            }
        }
    
        // Resalta los nodos
        highlightedNodes.forEach(nodeId => {
            const node = graph.getCell(nodeId);
            if (node) {
                node.attr('body/fill', 'yellow');
            }
        });
    }
    
    function getLinkWeight(graph, sourceId, targetId) {
        const link = findLinkBetweenNodes(graph, sourceId, targetId);
        return link ? parseFloat(link.labels()[0].attrs.text.text) : Infinity;
    }
    
    function findLinkBetweenNodes(graph, sourceId, targetId) {
        return graph.getLinks().find(link =>
            (link.source().id === sourceId && link.target().id === targetId) ||
            (link.source().id === targetId && link.target().id === sourceId)
        );
    }
    
    
    
    document.getElementById('solMinBtn').addEventListener('click', function() {
        const nodeId = prompt("Ingrese el ID del nodo inicial:");
        const startNode = graph.getCell(nodeId);
    
        if (!startNode) {
            alert("Nodo inicial inválido. Asegúrese de que el ID es correcto y está bien escrito.");
            return;
        }
    
        if (graph.getElements().length < 2) {
            alert("El grafo debe contener al menos dos nodos para ejecutar Dijkstra.");
            return;
        }
    
        const results = dijkstraAlgorithm(graph, startNode);
        highlightPaths(results.distances, results.previous);
    });
    

    // Evento de clic para el botón "guardarBtn"
    document.getElementById('guardarBtn').addEventListener('click', function() {
        var jsonData = JSON.stringify(graph.toJSON());
        var blob = new Blob([jsonData], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'grafo.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

        // Evento de clic para el botón "cargarBtn"
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
                var data = JSON.parse(jsonData);
                graph.fromJSON(data);
            };
            reader.readAsText(file);
        };
        input.click();
    });

    document.getElementById('limpiarBtn').addEventListener('click', () => {
        graph.resetCells();
    });
});
