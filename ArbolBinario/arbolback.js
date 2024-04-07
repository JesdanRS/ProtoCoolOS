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
    bt.insert(7);
    bt.insert(4);
    bt.insert(9);
    bt.insert(2);
    bt.insert(5);
    bt.insert(8);
    bt.insert(11);

    // Configura el lienzo SVG
    const margin = {top: 50, right: 20, bottom: 20, left: 20},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Aquí cambiamos la transformación del grupo SVG para ajustar el inicio del dibujo
    const svg = d3.select("#tree").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Generación del layout del árbol
    // Se ajusta el tamaño para reflejar la orientación vertical
    const treemap = d3.tree().size([height, width]);
    const nodesData = d3.hierarchy(bt.root, function(d) {
        return [d.left, d.right].filter(n => n !== null);
    });

    const treeData = treemap(nodesData);

    let nodes = treeData.descendants();
    let links = treeData.links(); // Usar .links() para obtener los enlaces correctos

    // Variable i para la identificación del nodo
    let i = 0;

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
        .attr("x", (d) => { 
            return d.children || d._children ? -13 : 13; 
        })
        .attr("text-anchor", (d) => { 
            return d.children || d._children ? "end" : "start"; 
        })
        .text((d) => { return d.data.value; });

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
});