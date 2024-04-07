document.addEventListener('DOMContentLoaded', function() {
    class TreeNode {
        constructor(value) {
          this.value = value;
          this.left = null;
          this.right = null;
        }
      }
      
      class BinaryTree {
        constructor() {
          this.root = null;
        }
      
        insert(value) {
          const newNode = new TreeNode(value);
          if (this.root === null) {
            this.root = newNode;
          } else {
            this.insertNode(this.root, newNode);
          }
        }
      
        insertNode(node, newNode) {
          if (newNode.value < node.value) {
            if (node.left === null) {
              node.left = newNode;
            } else {
              this.insertNode(node.left, newNode);
            }
          } else {
            if (node.right === null) {
              node.right = newNode;
            } else {
              this.insertNode(node.right, newNode);
            }
          }
        }
      
        // Traversal methods (in-order, pre-order, post-order)
        inOrderTraverse(node, callback) {
          if (node !== null) {
            this.inOrderTraverse(node.left, callback);
            callback(node.value);
            this.inOrderTraverse(node.right, callback);
          }
        }
      
        preOrderTraverse(node, callback) {
          if (node !== null) {
            callback(node.value);
            this.preOrderTraverse(node.left, callback);
            this.preOrderTraverse(node.right, callback);
          }
        }
      
        postOrderTraverse(node, callback) {
          if (node !== null) {
            this.postOrderTraverse(node.left, callback);
            this.postOrderTraverse(node.right, callback);
            callback(node.value);
          }
        }
    }
      
    // Initialize your tree
    const bt = new BinaryTree();

    // Agrega esta función para actualizar el árbol
    function updateTree() {
        const nodesData = d3.hierarchy(bt.root, function(d) {
            return [d.left, d.right].filter(n => n !== null);
        });
        drawTree(nodesData); // Pasar nodesData a drawTree
    }

    // Asigna un manejador de eventos al botón para agregar números al árbol
    document.getElementById('agregarNumBtn').addEventListener('click', function() {
        const num = prompt('Introduce nuevo nodo:');
        const value = parseInt(num);
        if (!isNaN(value)) {
            bt.insert(value);
            // Actualiza la visualización del árbol
            updateTree();
        } else {
            alert('Por favor, ingresa un número válido.');
        }
    });

    function drawTree(){
        // Configura el lienzo SVG
        const margin = {top: 50, right: 20, bottom: 20, left: 20},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    
        // Elimina el SVG existente antes de volver a dibujar
        d3.select("#tree").select("svg").remove();
    
        // Aquí cambiamos la transformación del grupo SVG para ajustar el inicio del dibujo
        const svg = d3.select("#tree").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        // Generación del layout del árbol
        const treemap = d3.tree().size([height, width]);
        const nodesData = d3.hierarchy(bt.root, function(d) {
            return [d.left, d.right].filter(n => n !== null);
        });
    
        // Calcula el tamaño total necesario basado en la profundidad y el número de nodos
        const totalLevels = d3.max(nodesData.descendants(), d => d.depth) + 1;
        const nodeWidth = 20;
        const nodeHeight = 150;
        const totalWidth = nodeWidth * nodesData.descendants().length;
        const totalHeight = nodeHeight * totalLevels;
    
        // Ajusta el tamaño del SVG
        svg.attr("width", totalWidth + margin.left + margin.right)
        .attr("height", totalHeight + margin.top + margin.bottom);
    
        // Actualiza la visualización de D3 con el nuevo tamaño
        treemap.size([totalHeight, totalWidth]);
    
        const treeData = treemap(nodesData);
    
        let nodes = treeData.descendants();
        let links = treeData.links(); // Usar .links() para obtener los enlaces correctos
    
        // Ajusta las posiciones de los nodos para una orientación vertical
        nodes.forEach((d) => { 
            const temp = d.x;
            d.x = d.y;
            d.y = temp;
        });

        // Variable i para la identificación del nodo
        let i = 0;

        // Sección de enlaces
        const link = svg.selectAll('path.link')
            .data(links, (d) => { return d.target.id; });

        // Agregando los enlaces al SVG
        const linkEnter = link.enter().append('path')
            .attr("class", "link")
            .style("stroke", "white") // Color visible de los enlaces
            .style("fill", "none")    // Asegurarse de que no haya relleno
            .attr('d', function(d) {
                // Crear una línea directa entre el nodo padre y el hijo
                return "M" + d.source.y + "," + d.source.x
                    + "L" + d.target.y + "," + d.target.x;
        });

        // Nodes section
        const node = svg.selectAll('g.node')
            .data(nodes, (d) => { return d.id || (d.id = ++i); });

        // Para los nodos
        const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", (d) => { 
            // Nota el intercambio de d.x por d.y para posicionar correctamente
            return "translate(" + d.y + "," + d.x + ")"; 
        });

        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 10)
            .style("fill", "#fff");

        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("text-anchor", "middle") // Alinea el texto al centro
            .text((d) => { return d.data.value; });

        function diagonal(s, d) {
            console.log("Diagonal called", s, d); // Esta línea es para depuración
            const path = `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`;
            return path;
        }

        // Example usage
        const printNode = (value) => console.log(value);
        bt.inOrderTraverse(bt.root, printNode); // In-order traversal
    }      
});