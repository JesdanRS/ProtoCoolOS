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
            return { vertexAdd: false, labelMove: false };
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
            return cellViewS !== cellViewT && magnetT;
        },
        validateMagnet: function(cellView, magnet) {
            // Adjust cursor and enable linking when on the magnet (border)
            if (magnet.getAttribute('magnet') === 'passive') {
                paper.el.style.cursor = 'default';
                return false;
            } else {
                paper.el.style.cursor = 'alias';
                return true;
            }
        },
        snapLinks: { radius: 75 },
        linkPinning: false,
        markAvailable: true
    });

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
                    strokeWidth: 2,
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
        if (document.querySelector('input[type="checkbox"]').checked) {
            var nodeName = prompt("Ingrese el nombre del nodo:");
            if (nodeName) {
                createNode(x, y, nodeName);
            }
        }
    });

    paper.on('cell:mouseover', function(cellView, evt, x, y) {
        // Change cursor to 'alias' only when hovering over the edge
        var bbox = cellView.getBBox();
        if (Math.abs(evt.clientX - bbox.x) <= 10 || Math.abs(evt.clientX - (bbox.x + bbox.width)) <= 10 || 
            Math.abs(evt.clientY - bbox.y) <= 10 || Math.abs(evt.clientY - (bbox.y + bbox.height)) <= 10) {
            document.body.style.cursor = 'alias';
        } else{
            document.body.style.cursor = 'default';
        }
    });

    paper.on('cell:mouseout', function(cellView) {
        document.body.style.cursor = 'default';
    });

    paper.on('link:connect', function(linkView) {
        var label = prompt('Ingrese el atributo para la arista:');
        linkView.model.label(0, { 
            attrs: { 
                text: { 
                    text: label || '',
                    fontWeight: 'bold',
                    fill: document.getElementById('cambiarColorTextoBtn').value, // Ajusta el color de la letra aquí
                    fontSize: 16, // Ajusta el tamaño de la fuente según necesites
                    textBackground: 'none', // Intenta establecer el fondo como 'none'
                    strokeWidth: 0.2,
                    stroke: 'white'
                },
                rect: { // Asegurándose de que el rectángulo alrededor del texto sea transparente o no existente
                    fill: 'none', 
                    stroke: 'none'
                }
            } 
        });
    });    
});
