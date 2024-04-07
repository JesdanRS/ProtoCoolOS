document.addEventListener('DOMContentLoaded', () => {
    const nodes = [];
    const edges = [];
    let counter = 0;

    function insertNode(treeNode, value, parentNodeId = null) {
        if (treeNode === null) {
            const nodeId = counter++;
            nodes.push({ id: nodeId, label: String(value) });
            if (parentNodeId !== null) {
                edges.push({ from: parentNodeId, to: nodeId });
            }
            return { value: value, left: null, right: null, id: nodeId };
        }
        if (value <= treeNode.value) { // Asegurarse de que los valores menores o iguales vayan a la izquierda
            treeNode.left = insertNode(treeNode.left, value, treeNode.id);
        } else {
            treeNode.right = insertNode(treeNode.right, value, treeNode.id);
        }
        return treeNode;
    }

    let binaryTree = null;

    document.getElementById('agregarNumBtn').addEventListener('click', function() {
        const numberToAdd = parseInt(prompt('Ingrese el número a agregar:'), 10);
        if (!isNaN(numberToAdd)) {
            binaryTree = insertNode(binaryTree, numberToAdd);
            draw();
        }
    });

    // Function to draw the binary tree using vis-network
    function draw() {
        const container = document.getElementById('arbolContainer');
        const data = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges),
        };
        const options = {
            layout: {
                hierarchical: {
                    direction: "UD",
                    sortMethod: "directed",
                },
            },
            edges: {
                smooth: true,
            },
            physics: false, // Deshabilitar la física para evitar que los nodos se muevan
            manipulation: {
                enabled: false, // Deshabilitar la manipulación directa de los nodos
            },
            interaction: {
                dragNodes: false, // Impedir arrastrar nodos
                dragView: true, // Permitir arrastrar la vista (navegación)
            },
        };
        new vis.Network(container, data, options);
    }
});
