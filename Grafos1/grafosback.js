document.addEventListener('DOMContentLoaded', function() {
    const grafoContainer = document.getElementById('grafo-container');
    const matrizContainer = document.getElementById('matriz-container');
    const matrizHeader = document.getElementById('matriz-header');
    const matrizBody = document.getElementById('matriz-body');
    const colorPicker = document.getElementById('cambiarColorBtn');
    let nodos = new vis.DataSet();
    let aristas = new vis.DataSet();
    let network = null;
    let estado = { seleccionando: false, nodoOrigen: null, colorActual: '#d2e5ff', modoEliminar: false };
    let ultimoIdNodo = 0; // Nuevo: Mantener el control del último ID de nodo utilizado

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
                        const atributoArista = prompt("Ingrese el atributo de la arista (ej. peso):", "");
                        if (atributoArista !== null) {
                            aristas.add({
                                from: nodoOrigen,
                                to: nodoDestino,
                                label: atributoArista
                            });
                        }
                    } else if(nodoOrigen === nodoDestino && !loopExistente(nodoOrigen)) {
                        const atributoArista = prompt("Ingrese el atributo de la arista (loop):", "");
                        if (atributoArista !== null) {
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
            } else {
                const coordenadas = params.pointer.canvas;
                const nombreNodo = prompt("Ingrese el nombre del nodo:", `Nodo ${ultimoIdNodo + 1}`);
                if (nombreNodo !== null) {
                    crearNodo(coordenadas.x, coordenadas.y, estado.colorActual, nombreNodo);
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
                    nodos.update({id: nodeId, label: nuevoNombre});
                }
            } else if (edgeId !== undefined) {
                const nuevoAtributo = prompt("Ingrese el nuevo atributo de la arista:", "");
                if (nuevoAtributo !== null) {
                    aristas.update({id: edgeId, label: nuevoAtributo});
                }
            }
        });

        nodos.on("*", function() {
            actualizarMatriz();
            comprobarVisibilidadMatriz();
        });
        aristas.on("*", function() {
            actualizarMatriz();
        });
    }

    function crearNodo(x, y, color, nombre) {
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

    function aristaDuplicada(origen, destino) {
        const aristasExistentes = aristas.get({
            filter: function(item) {
                return (item.from === origen && item.to === destino);
            }
        });
        return aristasExistentes.length > 0;
    }

    function loopExistente(nodo) {
        const loops = aristas.get({
            filter: function(item) {
                return item.from === nodo && item.to === nodo;
            }
        });
        return loops.length > 0;
    }

    function comprobarVisibilidadMatriz() {
        matrizContainer.style.display = nodos.length === 0 && aristas.length === 0 ? 'none' : 'block';
    }

    function actualizarMatriz() {
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

    function generarHTMLMatriz(matriz, nodosIds) {
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
        ultimoIdNodo = 0; // Restablecer el contador de ID de nodos al limpiar
        actualizarMatriz(); // Asegurar que la matriz se actualiza al limpiar
        comprobarVisibilidadMatriz();
    });

    inicializarRed();
});
