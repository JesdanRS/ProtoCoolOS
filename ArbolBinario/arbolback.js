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

        // Método para insertar una lista de números aleatorios en el árbol
        insertRandomList(quantity, min, max) {
            for (let i = 0; i < quantity; i++) {
              const randomValue = Math.floor(Math.random() * (max - min + 1) + min);
              if (!bt.contains(randomValue)) {
                this.insert(randomValue);
              }
            }
        }

        remove(value) {
            this.root = this.removeNode(this.root, value);
        }
    
        // Método modificado para eliminar el nodo y sus hijos directamente
        removeNode(node, value) {
            if (node === null) {
                return null;
            }
            if (value === node.value) {
                // Si el nodo a eliminar es el que se buscaba, se elimina todo el subárbol
                return null; // Elimina el nodo y sus hijos
            } else if (value < node.value) {
                node.left = this.removeNode(node.left, value);
            } else {
                node.right = this.removeNode(node.right, value);
            }
            return node;
        }

        findMinNode(node) {
            if(node.left === null)
                return node;
            else
                return this.findMinNode(node.left);
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
            if (!bt.contains(value)) { // Verifica si el valor ya está presente en el árbol
                bt.insert(value);
                // Actualiza la visualización del árbol
                updateTree();
            }
        } else {
            alert('Por favor, ingresa un número válido.');
        }
    });

    // Método para verificar si un valor está presente en el árbol
    BinaryTree.prototype.contains = function(value) {
        return this.search(this.root, value);
    };

    // Método de búsqueda recursiva para verificar si un valor está presente en el árbol
    BinaryTree.prototype.search = function(node, value) {
        if (node === null) {
            return false;
        } else if (value < node.value) {
            return this.search(node.left, value);
        } else if (value > node.value) {
            return this.search(node.right, value);
        } else {
            return true;
        }
    };

    // Agregar evento para generar árbol a partir de lista aleatoria
    document.getElementById('listaRandomBtn').addEventListener('click', function() {
        const quantity = parseInt(prompt('Ingrese la cantidad de números aleatorios a generar:'));
        if (!isNaN(quantity)) {
            const min = parseInt(prompt('Ingrese el número más pequeño:'));
            if (!isNaN(min)){
                const max = parseInt(prompt('Ingrese el número más grande:'));
                if (!isNaN(max)){
                    bt.root = null; // Limpiar el árbol actual
                    bt.insertRandomList(quantity, min, max); // Insertar números aleatorios
                    updateTree(); // Actualizar la visualización del árbol
                }
            }
        } else {
            alert('Por favor, ingrese números válidos.');
        }
    });

    // Agregar evento para limpiar y refrescar la página
    document.getElementById('limpiarBtn').addEventListener('click', function() {
        location.reload(); // Recargar la página para limpiar y refrescar el árbol
    });

    document.getElementById('ordenarPreBtn').addEventListener('click', function() {
        document.getElementById('tipoOrden').innerText = "Pre-Order";
        const result = [];
        const nodes = [];
        bt.preOrderTraverse(bt.root, function(value) {
            result.push(value);
        });
    
        document.getElementById('orden').innerText = result.join(', ');
    
        // Colores originales de los nodos y enlaces
        const originalColors = {
            nodes: [],
            links: []
        };
    
        function saveOriginalColors() {
            d3.selectAll('.node circle').each(function(d) {
                originalColors.nodes.push({id: d.data.value, color: d3.select(this).style('fill')});
            });
    
            d3.selectAll('.link').each(function(d) {
                originalColors.links.push({id: `${d.source.data.value}->${d.target.data.value}`, color: d3.select(this).style('stroke')});
            });
        }
    
        function restoreOriginalColors() {
            originalColors.nodes.forEach(function(node) {
                d3.selectAll(`.node circle`).filter(function(d) { return d.data.value === node.id; })
                    .style('fill', node.color);
            });
    
            originalColors.links.forEach(function(link) {
                d3.selectAll('.link').filter(function(d) { return `${d.source.data.value}->${d.target.data.value}` === link.id; })
                    .style('stroke', link.color);
            });
        }
    
        saveOriginalColors();
    
        let index = 0;
    
        function animateTraversal() {
            if (index < result.length) {
                const currentValue = result[index];
                const linksMust = d3.selectAll('.link').filter(function(d) {
                    return d.target.data.value === currentValue && 
                           (d.source.data.value === result[index + 1] || 
                            (bt.root && bt.root.value === currentValue)); // Root has no parent
                });
                const currentNode = d3.selectAll('.node circle').filter(function(d) { return d.data.value === currentValue; });
                const currentLink = d3.selectAll('.link').filter(function(d) {
                    return `${d.source.data.value}->${d.target.data.value}` === `${currentValue}->${result[index + 1]}`;
                });
    
                currentNode.transition()
                    .duration(900)
                    .style('fill', '#6bcff4');
    
                if (!currentLink.empty()) {
                    currentLink.transition()
                        .duration(900)
                        .style('stroke', '#6bcff4');
                }

                linksMust.transition()
                    .duration(900)
                    .style('stroke', '#6bcff4');
    
                index++;
                setTimeout(animateTraversal, 900); // Espera 1 segundo antes de continuar con el siguiente paso
            } else {
                setTimeout(restoreOriginalColors, 900); // Espera 1 segundo antes de restaurar los colores originales
            }
        }
    
        animateTraversal();
    });

    document.getElementById('ordenarInBtn').addEventListener('click', function() {
        document.getElementById('tipoOrden').innerText = "In-Order";
        const result = [];
        const nodes = [];
        bt.inOrderTraverse(bt.root, function(value) {
            result.push(value);
        });
    
        document.getElementById('orden').innerText = result.join(', ');
    
        // Colores originales de los nodos y enlaces
        const originalColors = {
            nodes: [],
            links: []
        };
    
        function saveOriginalColors() {
            d3.selectAll('.node circle').each(function(d) {
                originalColors.nodes.push({id: d.data.value, color: d3.select(this).style('fill')});
            });
    
            d3.selectAll('.link').each(function(d) {
                originalColors.links.push({id: `${d.source.data.value}->${d.target.data.value}`, color: d3.select(this).style('stroke')});
            });
        }
    
        function restoreOriginalColors() {
            originalColors.nodes.forEach(function(node) {
                d3.selectAll(`.node circle`).filter(function(d) { return d.data.value === node.id; })
                    .style('fill', node.color);
            });
    
            originalColors.links.forEach(function(link) {
                d3.selectAll('.link').filter(function(d) { return `${d.source.data.value}->${d.target.data.value}` === link.id; })
                    .style('stroke', link.color);
            });
        }
    
        saveOriginalColors();
    
        let index = 0;
    
        function animateTraversal() {
            if (index < result.length) {
                const currentValue = result[index];
                const linksMust = d3.selectAll('.link').filter(function(d) {
                    // Color the link to the parent after visiting both children
                    return d.target.data.value === currentValue && 
                           (d.source.data.value === result[index + 1] || 
                            (bt.root && bt.root.value === currentValue)); // Root has no parent
                });
                const currentNode = d3.selectAll('.node circle').filter(function(d) { return d.data.value === currentValue; });
                const currentLink = d3.selectAll('.link').filter(function(d) {
                    return `${d.source.data.value}->${d.target.data.value}` === `${currentValue}->${result[index + 1]}`;
                });
    
                currentNode.transition()
                    .duration(900)
                    .style('fill', '#6bcff4');
    
                if (!currentLink.empty()) {
                    currentLink.transition()
                        .duration(900)
                        .style('stroke', '#6bcff4');
                }

                linksMust.transition()
                    .duration(900)
                    .style('stroke', '#6bcff4');
    
                index++;
                setTimeout(animateTraversal, 900); // Espera 1 segundo antes de continuar con el siguiente paso
            } else {
                setTimeout(restoreOriginalColors, 900); // Espera 1 segundo antes de restaurar los colores originales
            }
        }
    
        animateTraversal();
    });
    
    document.getElementById('ordenarPostBtn').addEventListener('click', function() {
        document.getElementById('tipoOrden').innerText = "Post-Order";
        const result = [];
        const nodes = [];
        bt.postOrderTraverse(bt.root, function(value) {
            result.push(value);
        });
    
        document.getElementById('orden').innerText = result.join(', ');
    
        // Colores originales de los nodos y enlaces
        const originalColors = {
            nodes: [],
            links: []
        };
    
        function saveOriginalColors() {
            d3.selectAll('.node circle').each(function(d) {
                originalColors.nodes.push({id: d.data.value, color: d3.select(this).style('fill')});
            });
    
            d3.selectAll('.link').each(function(d) {
                originalColors.links.push({id: `${d.source.data.value}->${d.target.data.value}`, color: d3.select(this).style('stroke')});
            });
        }
    
        function restoreOriginalColors() {
            originalColors.nodes.forEach(function(node) {
                d3.selectAll(`.node circle`).filter(function(d) { return d.data.value === node.id; })
                    .style('fill', node.color);
            });
    
            originalColors.links.forEach(function(link) {
                d3.selectAll('.link').filter(function(d) { return `${d.source.data.value}->${d.target.data.value}` === link.id; })
                    .style('stroke', link.color);
            });
        }
    
        saveOriginalColors();
    
        let index = 0;
    
        function animateTraversal() {
            if (index < result.length) {
                const currentValue = result[index];
                const linksMust = d3.selectAll('.link').filter(function(d) {
                    // Color the link to the parent after visiting both children
                    return d.target.data.value === currentValue && 
                           (d.source.data.value === result[index + 1] || 
                            (bt.root && bt.root.value === currentValue)); // Root has no parent
                });
                const currentNode = d3.selectAll('.node circle').filter(function(d) { return d.data.value === currentValue; });
                const currentLink = d3.selectAll('.link').filter(function(d) {
                    return `${d.source.data.value}->${d.target.data.value}` === `${currentValue}->${result[index + 1]}`;
                });
    
                currentNode.transition()
                    .duration(900)
                    .style('fill', '#6bcff4');
    
                if (!currentLink.empty()) {
                    currentLink.transition()
                        .duration(900)
                        .style('stroke', '#6bcff4');
                }

                linksMust.transition()
                    .duration(900)
                    .style('stroke', '#6bcff4');
    
                index++;
                setTimeout(animateTraversal, 900); // Espera 1 segundo antes de continuar con el siguiente paso
            } else {
                setTimeout(restoreOriginalColors, 900); // Espera 1 segundo antes de restaurar los colores originales
            }
        }

        animateTraversal();
    });

    // Obtén el modal
    var modal = document.getElementById("modalContainer");

    document.getElementById('listaCompBtn').addEventListener('click', function() {
        if (!bt.isEmpty()) { // Verifica si el árbol no está vacío
            modal.style.display = "block";
            compararInPost(bt);
        } else {
            alert('El árbol está vacío.');
        }
    });
    
    // Añadir método isEmpty a BinaryTree para verificar si el árbol está vacío
    BinaryTree.prototype.isEmpty = function() {
        return this.root === null;
    };      

    // Obtén el elemento <span> que cierra el modal
    var span = document.getElementsByClassName("close")[0];

    // Cuando el usuario haga clic en <span> (x), cierra el modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Cuando el usuario haga clic en cualquier lugar fuera del modal, ciérralo
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    function compararInPost(bt) {
        const inOrder = [];
        const postOrder = [];
        
        // Llenar las listas inOrder y postOrder
        bt.inOrderTraverse(bt.root, value => inOrder.push(value));
        bt.postOrderTraverse(bt.root, value => postOrder.push(value));
        
        function buildTree(inOrder, postOrder) {
            if(inOrder.length === 0 || postOrder.length === 0) return null;
            
            const rootVal = postOrder[postOrder.length - 1];
            const root = new TreeNode(rootVal);
            
            const index = inOrder.indexOf(rootVal);
            
            root.left = buildTree(inOrder.slice(0, index), postOrder.slice(0, index));
            root.right = buildTree(inOrder.slice(index + 1), postOrder.slice(index, -1));
            
            return root;
        }

        document.getElementById('Inorden').innerText = inOrder.join(', ');
        document.getElementById('Postorden').innerText = postOrder.join(', ');
        
        bt.root = buildTree(inOrder, postOrder);
        // Suponiendo que existe una función updateTree para actualizar la visualización del árbol
        updateTree();
    }

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
        const nodeHeight = 120;
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
            return "translate(" + d.y + "," + d.x + ")"; 
        })
        .on('contextmenu', function(event, d) {
            event.preventDefault(); // Previene el menú contextual predeterminado
            bt.remove(d.data.value); // Llama al método remove con el valor del nodo seleccionado
            updateTree(); // Actualiza el árbol para reflejar los cambios
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
    }      


    function exportarArbol(nombreArchivo) {
        const datosExportar = {
            root: bt.root
        };
        const datosStr = JSON.stringify(datosExportar);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(datosStr);
    
        let exportarLink = document.createElement('a');
        exportarLink.setAttribute('href', dataUri);
        exportarLink.setAttribute('download', nombreArchivo || 'arbol_binario.json');
        document.body.appendChild(exportarLink);
    
        exportarLink.click();
        document.body.removeChild(exportarLink);
    }
    
    document.getElementById('exportBtn').addEventListener('click', function() {
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "arbol_binario.json");
        exportarArbol(nombreArchivo);
    });

    function importarArbol(event) {
        const archivo = event.target.files[0];
        if (!archivo) {
            return;
        }
    
        const reader = new FileReader();
        reader.onload = function(fileEvent) {
            try {
                const datos = JSON.parse(fileEvent.target.result);
                bt.root = datos.root; // Asigna el árbol importado al árbol binario
                updateTree(); // Actualiza la visualización del árbol
            } catch (error) {
                console.error('Error al importar el archivo', error);
            }
        };
        reader.readAsText(archivo);
    }

    document.getElementById('importBtn').addEventListener('click', function() {
        document.getElementById('importInput').click();
    });
    
    document.getElementById('importInput').addEventListener('change', importarArbol);

    let inOrderList = [];
    let preOrderList = [];
    let postOrderList = [];

    document.getElementById('submitPreOrder').addEventListener('click', function() {
        preOrderList = document.getElementById('inputPreOrder').value.split(',').map(Number);
        if (preOrderList.some(isNaN)) {
            alert('Por favor, ingresa una lista válida de números para Pre-Order.');
        } else {
            console.log('Pre-Order guardado:', preOrderList);
        }
    });

    document.getElementById('submitInOrder').addEventListener('click', function() {
        inOrderList = document.getElementById('inputInOrder').value.split(',').map(Number);
        if (inOrderList.some(isNaN)) {
            alert('Por favor, ingresa una lista válida de números para In-Order.');
        } else {
            console.log('In-Order guardado:', inOrderList);
        }
    });

    document.getElementById('submitPostOrder').addEventListener('click', function() {
        postOrderList = document.getElementById('inputPostOrder').value.split(',').map(Number);
        if (postOrderList.some(isNaN)) {
            alert('Por favor, ingresa una lista válida de números para Post-Order.');
        } else {
            console.log('Post-Order guardado:', postOrderList);
        }
    });

    document.getElementById('reconstructPreIn').addEventListener('click', function() {
        if (preOrderList.length > 0 && inOrderList.length > 0 && validateLists(preOrderList, inOrderList, postOrderList)) {
            let clonedPreOrder = [...preOrderList];
            let clonedInOrder = [...inOrderList];
            clearAndRebuildTree(buildTreeFromPreIn, clonedPreOrder, clonedInOrder);
        } else {
            alert('Asegúrate de que las listas Pre-Order e In-Order estén correctamente guardadas y sean consistentes.');
        }
    });

    document.getElementById('reconstructInPost').addEventListener('click', function() {
        if (inOrderList.length > 0 && postOrderList.length > 0 && validateLists(preOrderList, inOrderList, postOrderList)) {
            let clonedInOrder = [...inOrderList];
            let clonedPostOrder = [...postOrderList];
            clearAndRebuildTree(buildTreeFromInPost, clonedInOrder, clonedPostOrder);
        } else {
            alert('Asegúrate de que las listas In-Order y Post-Order estén correctamente guardadas y sean consistentes.');
        }
    });

    document.getElementById('reconstructPrePost').addEventListener('click', function() {
        if (preOrderList.length > 0 && postOrderList.length > 0 && validateLists(preOrderList, inOrderList, postOrderList)) {
            let clonedPreOrder = [...preOrderList];
            let clonedPostOrder = [...postOrderList];
            clearAndRebuildTree(buildTreeFromPrePost, clonedPreOrder, clonedPostOrder);
        } else {
            alert('Asegúrate de que las listas Pre-Order y Post-Order estén correctamente guardadas y sean consistentes.');
        }
    });


    function validateLists(preOrder, inOrder, postOrder) {
        if (preOrder.length !== inOrder.length || inOrder.length !== postOrder.length) {
            alert('Las listas deben tener la misma longitud.');
            return false;
        }
    
        let sortedPre = [...preOrder].sort((a, b) => a - b);
        let sortedIn = [...inOrder].sort((a, b) => a - b);
        let sortedPost = [...postOrder].sort((a, b) => a - b);
    
        for (let i = 0; i < sortedPre.length; i++) {
            if (sortedPre[i] !== sortedIn[i] || sortedIn[i] !== sortedPost[i]) {
                alert('Las listas deben contener los mismos elementos.');
                return false;
            }
        }
    
        return true;
    }    

    function clearAndRebuildTree(buildFunction, list1, list2) {
        bt.root = null; // Limpia el árbol actual completamente.
        bt.root = buildFunction(list1, list2); // Reconstruye el árbol con las listas clonadas.
        updateTree(); // Actualiza la visualización del árbol.
    }
    

    function buildTreeFromPreIn(preOrder, inOrder) {
        if (preOrder.length === 0 || inOrder.length === 0) return null;
        let rootValue = preOrder[0];
        let root = new TreeNode(rootValue);
        let index = inOrder.indexOf(rootValue);
    
        root.left = buildTreeFromPreIn(preOrder.slice(1, index + 1), inOrder.slice(0, index));
        root.right = buildTreeFromPreIn(preOrder.slice(index + 1), inOrder.slice(index + 1));
        return root;
    }
    
    function buildTreeFromInPost(inOrder, postOrder) {
        if (inOrder.length === 0 || postOrder.length === 0) return null;
    
        // Extraer la raíz del final de postOrder
        let rootValue = postOrder.pop();
        let root = new TreeNode(rootValue);
    
        // Encontrar el índice de la raíz en inOrder
        let index = inOrder.indexOf(rootValue);
    
        // Construir subárboles izquierdo y derecho
        // Asegúrate de ajustar correctamente las divisiones de postOrder
        root.left = buildTreeFromInPost(inOrder.slice(0, index), postOrder.slice(0, index));
        root.right = buildTreeFromInPost(inOrder.slice(index + 1), postOrder.slice(index));
    
        return root;
    }
    
    function buildTreeFromPrePost(preOrder, postOrder) {
        if (!preOrder.length || !postOrder.length) return null;
        if (preOrder.length === 1) return new TreeNode(preOrder[0]);
    
        let rootValue = preOrder[0];
        let root = new TreeNode(rootValue);
    
        if (preOrder.length === 1) return root;
    
        // Encuentra el segundo elemento de Pre-Order en Post-Order para dividir el árbol
        let leftRoot = preOrder[1];
        let idx = postOrder.indexOf(leftRoot);
    
        // Asegúrate de copiar las listas al hacer slice para evitar mutación
        let leftPre = preOrder.slice(1, idx + 2);
        let rightPre = preOrder.slice(idx + 2);
        let leftPost = postOrder.slice(0, idx + 1);
        let rightPost = postOrder.slice(idx + 1, postOrder.length - 1);
    
        root.left = buildTreeFromPrePost(leftPre, leftPost);
        root.right = buildTreeFromPrePost(rightPre, rightPost);
    
        return root;
    }
    
});
