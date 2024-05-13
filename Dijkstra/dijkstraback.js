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
