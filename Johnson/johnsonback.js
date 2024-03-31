document.addEventListener('DOMContentLoaded', function() {
    const grafoContainer = document.getElementById('grafo-container');
    const matrizContainer = document.getElementById('matriz-container');
    const matrizHeader = document.getElementById('matriz-header');
    const matrizBody = document.getElementById('matriz-body');
    const importarArchivo = document.getElementById('importarArchivo');
    const colorPicker = document.getElementById('cambiarColorBtn');
    const cambiarColorTextoBtn = document.getElementById('cambiarColorTextoBtn');
    let estado = {
        seleccionando: false,
        nodoOrigen: null,
        colorActual: '#d2e5ff',
        colorTextoActual: '#ffffff', // Color de texto predeterminado
        modoEliminar: false
    };
    let nodos = new vis.DataSet();
    let aristas = new vis.DataSet();
    let network = null;
    let ultimoIdNodo = 0; // Mantener el control del último ID de nodo utilizado

    const opciones = { //Opciones de grafo
        nodes: {
            shape: 'circle',
            font: {
                size: 14,
                color: estado.colorTextoActual,
                multi: true,
                vadjust: -15,
                align: 'center'
            },
            borderWidth: 2,
            scaling: {
                min: 16,
                max: 32,
                label: {
                    heightConstraint: { valign: 'top' },
                    enabled: true,
                    min: 14,
                    max: 30,
                    drawThreshold: 8,
                    maxVisible: 20,
                    align: 'center'
                }
            },
            shapeProperties: {
                useBorderWithImage: true
            },
            margin: {
                top: 20,
                left: 20,
                right: 20,
                bottom: 20
            }
        },
        edges: {
            arrows: 'to',
            selfReferenceSize: 20,
            selfReference: {
                angle: Math.PI / 4
            },
            font: {
                align: 'top'
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

        network.on("click", function(params) { // Entrar al modo eliminar
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
                if (estado.seleccionando) { // Verificación de nodo seleccionado
                    const nodoOrigen = estado.nodoOrigen;
                    const nodoDestino = nodeId;
                    // Solo permitir la creación si no es un loop y no existe arista duplicada
                    if (nodoOrigen !== nodoDestino && !aristaDuplicada(nodoOrigen, nodoDestino)) {
                        let atributoArista;
                        do {
                            atributoArista = prompt("Ingrese el atributo de la arista (ej. peso):", "");
                            if (atributoArista === null) break;
                        } while (isNaN(atributoArista) || atributoArista.trim() === "");
                        
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
            } else { // Si no hay nodo para seleccionar
                const coordenadas = params.pointer.canvas;
                const nombreNodo = prompt("Ingrese el nombre del nodo:", `Nodo ${ultimoIdNodo + 1}`);
                if (nombreNodo !== null) {
                    crearNodo(coordenadas.x, coordenadas.y, estado.colorActual, nombreNodo);
                }
            }
        });

        network.on("oncontext", function(params) { // Cambiar nombre nodo o arista con click derecho
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

        network.on("afterDrawing", function (ctx) {
            nodos.forEach((nodo) => {
                const nodeId = nodo.id;
                const nodePosition = network.getPositions([nodeId])[nodeId];
                const x = nodePosition.x;
                const y = nodePosition.y;

                // Calcula el valor acumulado y de resta del nodo
                let valorAcumuladoNodo = calcularValorAcumuladoNodo(nodeId);
                let valorRestadoNodo = calcularValoresResta(nodeId);
        
                // Utiliza el contexto del canvas (ctx) para medir el texto
                ctx.font = `${opciones.nodes.font.size}px Arial`;
                const textWidth = ctx.measureText(nodo.label).width;
        
                // Calcula el tamaño del nodo basándose en el texto y el margen
                const nodeWidth = textWidth + opciones.nodes.margin.left + opciones.nodes.margin.right;

                // Ajusta aquí para cambiar la posición del contador
                const textOffsetY = nodeWidth /4; // Posición Y debajo del nodo
                const textOffsetXLeft = -nodeWidth/3; // Posición X para el contador de la izquierda
                const textOffsetXRight = nodeWidth/6;

                // Dibuja el contador de la parte baja izquierda
                ctx.fillStyle = nodo.font.color;
                ctx.font = "14px Arial";
                ctx.align = 'left';
                ctx.fillText(valorAcumuladoNodo.toString(), x + textOffsetXLeft, y + textOffsetY);
                ctx.align = 'right';
                ctx.fillText(valorRestadoNodo.toString(), x + textOffsetXRight, y + textOffsetY);
        
                // Dibuja una línea horizontal en el medio del nodo
                ctx.beginPath();
                ctx.moveTo(x - nodeWidth / 2, y);
                ctx.lineTo(x + nodeWidth / 2, y);
                ctx.strokeStyle = nodo.font.color; // Usa el color del texto almacenado en la propiedad del nodo
                ctx.stroke();
        
                // Ejemplo adicional: Dibuja una línea vertical en el medio del nodo
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + nodeWidth / 2);
                ctx.strokeStyle = nodo.font.color; // Usa el mismo color para la línea vertical
                ctx.stroke();
            });

            aristas.forEach((arista) => {
                const fromId = arista.from;
                const toId = arista.to;
                const fromNodePosition = network.getPositions([fromId])[fromId];
                const toNodePosition = network.getPositions([toId])[toId];
        
                // Calcula la holgura
                const valorArista = parseFloat(arista.label) || 0;
                const sumaFromNode = calcularValorAcumuladoNodo(fromId);
                const restaToNode = calcularValoresResta(toId);
                const holgura = restaToNode - sumaFromNode - valorArista;

                // Calcula ángulo de inclinación para el texto
                let angle = Math.atan2(toNodePosition.y - fromNodePosition.y, toNodePosition.x - fromNodePosition.x);
                if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
                    angle += Math.PI; // Ajusta el ángulo si es necesario
                }
        
                // Configura la posición para dibujar la holgura debajo de la arista
                const medioX = (fromNodePosition.x + toNodePosition.x) / 2;
                const medioY = (fromNodePosition.y + toNodePosition.y) / 2 + 15; // Ajusta según sea necesario
        
                // Define el estilo de la fuente para la holgura desde cero
                const holguraFont = "bold 14px Arial";
                const holguraStrokeWidth = 2;
                const holguraStrokeColor = "#ffffff";
        
                // Dibuja la holgura
                ctx.font = holguraFont;
                ctx.fillStyle = '#343434';
                ctx.textAlign = "center";
                ctx.textBaseline = 'middle'; // Alinea el texto verticalmente en el centro

                // Guarda el estado actual del contexto antes de la transformación
                ctx.save();

                // Translada y rota el contexto para dibujar el texto perpendicular a la arista
                ctx.translate(medioX, medioY);
                ctx.rotate(angle);

                // Dibuja el contorno del texto si es necesario
                if (holguraStrokeWidth > 0) {
                    ctx.strokeStyle = holguraStrokeColor;
                    ctx.lineWidth = holguraStrokeWidth;
                    ctx.strokeText(`h=${holgura}`, 0, 0);
                }

                // Dibuja el texto de la holgura
                ctx.fillText(`h=${holgura}`, 0, 0);

                ctx.restore();
            });
        });
               

        nodos.on("*", function() { // Verificar acciones sobre nodo
            actualizarMatriz();
            comprobarVisibilidadMatriz();
            network.redraw();
        });
        aristas.on("*", function() { // Verificar acciones sobre aristas
            actualizarMatriz();
            comprobarVisibilidadMatriz();
            network.redraw();
        });
    }

    function destacarRutaCritica() {
        const colorRutaCritica = 'Green'; // Define un color para la ruta crítica
    
        // Identificar el nodo final (nodo sin aristas salientes)
        let nodoFinal = null;
        nodos.forEach(nodo => {
            if (!aristas.get({ filter: arista => arista.from === nodo.id }).length) {
                nodoFinal = nodo.id;
            }
        });
    
        // Recopilar IDs de los nodos que están en la ruta crítica para cambiar su color
        let nodosEnRutaCritica = new Set();
    
        aristas.forEach((arista) => {
            const valorArista = parseFloat(arista.label) || 0;
            const sumaFromNode = calcularValorAcumuladoNodo(arista.from);
            const restaToNode = calcularValoresResta(arista.to);
            const holgura = restaToNode - sumaFromNode - valorArista;
    
            if (holgura === 0) { // Si la holgura es cero, es parte de la ruta crítica
                // Añadir nodos al conjunto
                nodosEnRutaCritica.add(arista.from);
                nodosEnRutaCritica.add(arista.to);
            }
        });
    
        // Ahora actualizamos el color de las aristas que están en la ruta crítica
        aristas.forEach((arista) => {
            const valorArista = parseFloat(arista.label) || 0;
            const sumaFromNode = calcularValorAcumuladoNodo(arista.from);
            const restaToNode = calcularValoresResta(arista.to);
            const holgura = restaToNode - sumaFromNode - valorArista;
    
            if (holgura === 0) { // Si la holgura es cero, es parte de la ruta crítica
                aristas.update({ id: arista.id, color: colorRutaCritica });
            }
        });
    
        // Cambiar el color del nodo final
        if (nodoFinal !== null) {
            nodos.update({ id: nodoFinal, color: colorRutaCritica });
        }

    
        // Mostrar el nombre del nodo de inicio y final
        const nodoInicio = nodos.getIds()[0]; // Suponiendo que el primer nodo es el nodo de inicio
        const nombreNodoInicio = nodos.get(nodoInicio).label;
        const nombreNodoFinal = nodos.get(nodoFinal).label;
    
        alert(`Nodo de inicio: ${nombreNodoInicio}\nNodo final: ${nombreNodoFinal}`);
    }
    
    

    // Función para calcular el valor acumulado para cada nodo
    function calcularValorAcumuladoNodo(nodoId) {
        const nodosIds = nodos.getIds();
        const nodosVisitados = new Set(); // Conjunto para evitar ciclos infinitos
        let valorAcumulado = 0;
    
        function dfs(currentNodeId) {
            if (nodosVisitados.has(currentNodeId)) return; // Evitar ciclos infinitos
            nodosVisitados.add(currentNodeId);
    
            const aristasEntrantes = aristas.get({
                filter: arista => arista.to === currentNodeId
            });
    
            let maxValorEntrante = 0;
            aristasEntrantes.forEach(arista => {
                const valorArista = parseFloat(arista.label) || 0;
                const valorOrigen = calcularValorAcumuladoNodo(arista.from); // Utilizar la recursión para obtener el valor acumulado del nodo origen
                const suma = valorOrigen + valorArista;
                if (suma > maxValorEntrante) {
                    maxValorEntrante = suma;
                }
            });
    
            valorAcumulado = maxValorEntrante;
        }
    
        dfs(nodoId);
    
        return valorAcumulado;
    }

    function calcularValoresResta(nodeId) {
        const nodosIds = nodos.getIds();
        const nodosVisitados = new Set(); // Conjunto para evitar ciclos infinitos
        const valoresResta = {};
    
        // Inicializar valores de resta basándose en valores acumulativos
        nodosIds.forEach(id => {
            valoresResta[id] = calcularValorAcumuladoNodo(id); // Inicializa con el valor acumulado
        });
    
        function dfs(currentNodeId) {
            if (nodosVisitados.has(currentNodeId)) return; // Evitar ciclos infinitos
            nodosVisitados.add(currentNodeId);
    
            const aristasSalientes = aristas.get({
                filter: arista => arista.from === currentNodeId
            });
    
            if (aristasSalientes.length > 0) {
                let minResta = Number.MAX_SAFE_INTEGER;
    
                aristasSalientes.forEach(arista => {
                    const valorArista = parseFloat(arista.label) || 0;
                    const valorRestaDestino = valoresResta[arista.to];
                    const resta = valorRestaDestino - valorArista;
    
                    if (resta < minResta) {
                        minResta = resta;
                    }
                });
    
                valoresResta[currentNodeId] = minResta;
    
                // Recursivamente llamar para nodos de destino
                aristasSalientes.forEach(arista => {
                    dfs(arista.to);
                });
            }
        }
    
        dfs(nodeId);
    
        return valoresResta[nodeId];
    }

    cambiarColorTextoBtn.addEventListener('input', function(event) {
        estado.colorTextoActual = event.target.value;
        // Se elimina el recorrido y actualización de nodos existentes
        // Ahora solo se actualiza el estado para que los nuevos nodos usen este color
    });

    // Asegúrate de actualizar la sección donde creas nodos para usar el estado.colorTextoActual
    function crearNodo(x, y, color, nombre) {
        ultimoIdNodo++; // Incrementar el ID del último nodo para asegurar que sea único
        nodos.add({
            id: ultimoIdNodo,
            label: nombre,
            x: x,
            y: y,
            color: color,
            font: { color: estado.colorTextoActual }, // Se establece el color del texto para el nuevo nodo
            physics: false
        });
    }

    function aristaDuplicada(origen, destino) {
        const aristasExistentes = aristas.get({
            filter: function(item) {
                return (item.from === origen && item.to === destino) || (item.from === destino && item.to === origen);
            }
        });
        return aristasExistentes.length > 0;
    }

    function comprobarVisibilidadMatriz() { // Comprobar si la matriz está vacía o no
        matrizContainer.style.display = nodos.length === 0 && aristas.length === 0 ? 'none' : 'block';
    }

    function actualizarMatriz() { // Actualización de datos en la matriz
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

    function generarHTMLMatriz(matriz, nodosIds) { // Generar HTML de la matriz según datos
        const nodosLabels = nodosIds.map(id => nodos.get(id).label);
        const sumaFilas = {};
        const sumaColumnas = {};
    
        nodosIds.forEach(id => {
            sumaFilas[id] = 0;
            sumaColumnas[id] = 0;
        });
    
        nodosIds.forEach(id => {
            nodosIds.forEach(idInterno => {
                sumaFilas[id] += matriz[id][idInterno];
                sumaColumnas[idInterno] += matriz[id][idInterno];
            });
        });
    
        const colorInicio = 'Green'; // Verde para el nodo de inicio
        const colorFinal = 'Green'; // Rojo para el nodo final
    
        let encabezadoHTML = '<th></th>';
        nodosLabels.forEach((label, index) => {
            const id = nodosIds[index];
            const color = sumaColumnas[id] === 0 ? colorInicio : (sumaFilas[id] === 0 ? colorFinal : '');
            encabezadoHTML += `<th style="background-color:${color}">${label}</th>`;
        });
        encabezadoHTML += '<th>Suma</th>';
        matrizHeader.innerHTML = encabezadoHTML;
    
        let cuerpoHTML = '';
        nodosIds.forEach(id => {
            const color = sumaFilas[id] === 0 ? colorFinal : '';
            cuerpoHTML += `<tr><th style="background-color:${color}">${nodos.get(id).label}</th>`;
            nodosIds.forEach(idInterno => {
                cuerpoHTML += `<td>${matriz[id][idInterno]}</td>`;
            });
            cuerpoHTML += `<td>${sumaFilas[id]}</td></tr>`;
        });
    
        cuerpoHTML += '<tr><th>Suma</th>';
        nodosIds.forEach(id => {
            cuerpoHTML += `<td>${sumaColumnas[id]}</td>`;
        });
        const total = nodosIds.reduce((acc, id) => acc + sumaFilas[id], 0);
        cuerpoHTML += `<td>${total}</td></tr>`;
        matrizBody.innerHTML = cuerpoHTML;
    }
    

    function exportarComoPNG(nombreArchivo) { // Exportar imagen del grafo
        html2canvas(grafoContainer).then(canvas => {
            let enlace = document.createElement('a');
            enlace.download = nombreArchivo || 'grafo.png';
            enlace.href = canvas.toDataURL('image/png');
            enlace.click();
            enlace.remove();
        });
    }

    async function exportarComoPDF(nombreArchivo) { // Exportar PDF del grafo
        const canvas = await html2canvas(grafoContainer);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'landscape',
        });
        pdf.addImage(imgData, 'PNG', 10, 10);
        pdf.save(nombreArchivo || 'grafo.pdf');
    }

    function exportarGrafo(nombreArchivo) { // Exportar el archivo JSON del grafo y la matriz
        const datosExportar = {
            nodos: nodos.get({ returnType: "Object" }),
            aristas: aristas.get(),
            estado: estado
        };
        const datosStr = JSON.stringify(datosExportar);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(datosStr);
        
        let exportarLink = document.createElement('a');
        exportarLink.setAttribute('href', dataUri);
        exportarLink.setAttribute('download', nombreArchivo || 'grafo.png');
        document.body.appendChild(exportarLink);
        
        exportarLink.click();
        document.body.removeChild(exportarLink);
    }

    function importarGrafo(event) { // Importar un archivo JSON de algún grafo
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
                nodos.add(Object.values(datos.nodos)); // Agrega nodos manteniendo posiciones
                aristas.add(datos.aristas);
                estado = datos.estado;
                colorPicker.value = estado.colorActual;
                ultimoIdNodo = Math.max(...Object.values(datos.nodos).map(nodo => nodo.id));
                actualizarMatriz();
                comprobarVisibilidadMatriz();
            } catch (error) {
                console.error('Error al importar el archivo', error);
            }
        };
        reader.readAsText(archivo);
    }

    guardarBtn.addEventListener('click', function() { // Se apreta el botón de exportar
        exportOptions.style.display = 'block';
    });

    exportPNG.addEventListener('click', function() { // Se apreta el botón de exportar como PNG
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.png");
        exportarComoPNG(nombreArchivo);
        exportOptions.style.display = 'none';
    });
    document.getElementById('rutaCriticaBtn').addEventListener('click', destacarRutaCritica);

    exportPDF.addEventListener('click', function() { // Se apreta el botón de exportar como PDF
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.pdf");
        exportarComoPDF(nombreArchivo);
        exportOptions.style.display = 'none';
    });

    exportJSON.addEventListener('click', function() { // Se apreta el botón de exportar como JSON (editable)
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.json");
        exportarGrafo(nombreArchivo);
        exportOptions.style.display = 'none';
    });

    cargarBtn.addEventListener('click', () => importarArchivo.click()); // Se apreta el botón de importar
    importarArchivo.addEventListener('change', importarGrafo);

    document.getElementById('eliminarBtn').addEventListener('click', function() { // Cambia el cursor en modo eliminar
        estado.modoEliminar = !estado.modoEliminar;
        grafoContainer.style.cursor = estado.modoEliminar ? 'crosshair' : '';
    });

    document.getElementById('cambiarColorBtn').addEventListener('input', function(event) { // Cambiar color de nodos 
        estado.colorActual = event.target.value;
    });

    document.getElementById('limpiarBtn').addEventListener('click', function() { // Limpiar grafo completo y actualizar matriz
        nodos.clear();
        aristas.clear();
        estado = { seleccionando: false, nodoOrigen: null, colorActual: estado.colorActual, colorTextoActual: estado.colorTextoActual, modoEliminar: false };
        ultimoIdNodo = 0; // Restablecer el contador de ID de nodos al limpiar
        actualizarMatriz(); // La matriz se actualiza al limpiar
        comprobarVisibilidadMatriz();
    });

    inicializarRed();
});