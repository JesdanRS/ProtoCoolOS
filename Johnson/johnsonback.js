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

    function destacarRutaCritica(colorRuta) {
        // Obtener el nodo inicial y final
        const nodoInicial = nodos.getIds().filter(id => aristas.get({ filter: arista => arista.to === id }).length === 0)[0];
        const nodoFinal = nodos.getIds().filter(id => aristas.get({ filter: arista => arista.from === id }).length === 0)[0];
        
        // Obtener la holgura para todas las aristas
        const holguras = {};
        aristas.forEach(arista => {
            const valorArista = parseFloat(arista.label) || 0;
            const sumaFromNode = calcularValorAcumuladoNodo(arista.from);
            const restaToNode = calcularValoresResta(arista.to);
            holguras[arista.id] = restaToNode - sumaFromNode - valorArista;
        });
        
        // Obtener las aristas que tienen holgura 0
        const aristasRutaCritica = Object.keys(holguras).filter(aristaId => holguras[aristaId] === 0);
        
        // Obtener los nodos conectados por estas aristas
        const nodosRutaCritica = new Set();
        aristasRutaCritica.forEach(aristaId => {
            const arista = aristas.get(aristaId);
            nodosRutaCritica.add(arista.from);
            nodosRutaCritica.add(arista.to);
        });
        
        // Marcar los nodos de la ruta crítica con el mismo color que las aristas de la ruta crítica
        const colorRutaCritica = colorRuta; // Color de la ruta crítica
        nodosRutaCritica.forEach(nodoId => {
            nodos.update({ id: nodoId, color: { background: colorRutaCritica } }); // Cambiar el color de fondo del nodo
        });
        
        // Restablecer el color de fondo de los nodos que no están en la ruta crítica
        nodos.forEach(nodo => {
            if (!nodosRutaCritica.has(nodo.id)) {
                nodos.update({ id: nodo.id, color: { background: undefined } }); // Restablecer el color de fondo del nodo
            }
        });
        
        // Marcar las aristas de la ruta crítica con el color de la ruta crítica
        aristasRutaCritica.forEach(aristaId => {
            aristas.update({ id: aristaId, color: colorRutaCritica }); // Cambiar el color de la arista
        });
        
        // Restablecer el color de las demás aristas que no están en la ruta crítica
        aristas.forEach(arista => {
            if (!aristasRutaCritica.includes(arista.id)) {
                aristas.update({ id: arista.id, color: undefined }); // Restablecer el color de la arista
            }
        });

        const nombreNodoInicio = nodos.get(nodoInicial).label;
        const nombreNodoFinal = nodos.get(nodoFinal).label;
    
        alert(`Nodo de inicio: ${nombreNodoInicio}\nNodo final: ${nombreNodoFinal}`);
    }
    
    function hexToRGBA(hex, alpha) {
        // Expresión regular para validar el formato hexadecimal
        const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        const result = hexRegex.exec(hex);
        
        // Convertir el valor hexadecimal a decimal y luego a una cadena RGBA
        return result
            ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
            : null;
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

    function generarHTMLMatriz(matriz, nodosIds) {
        // Identificar el nodo inicial y final basándose en las aristas
        let nodoInicial = null;
        let nodoFinal = null;
        
        nodosIds.forEach(id => {
            if (aristas.get({ filter: (arista) => arista.from === id }).length === 0) {
                nodoFinal = id;
            }
            if (aristas.get({ filter: (arista) => arista.to === id }).length === 0) {
                nodoInicial = id;
            }
        });
    
        // Aquí podrías establecer los colores que deseas utilizar
        const colorInicio = '#00B32C'; // Verde para el nodo inicial
        const colorFinal = '#DC3D2A'; // Rojo para el nodo final
    
        let encabezadoHTML = '<th></th>';
        let sumaTotalColumnas = Array(nodosIds.length).fill(0); // Inicializa un array con ceros para las sumas de las columnas
        
        nodosIds.forEach((id, index) => {
            const label = nodos.get(id).label;
            const esNodoInicial = id === nodoInicial;
            const color = esNodoInicial ? colorInicio : '';
            encabezadoHTML += `<th style="background-color:${color}">${label}</th>`;
        });
        encabezadoHTML += '<th>Suma</th>';
        matrizHeader.innerHTML = encabezadoHTML;
    
        let cuerpoHTML = '';
        nodosIds.forEach(id => {
            const esNodoFinal = id === nodoFinal;
            const color = esNodoFinal ? colorFinal : '';
            cuerpoHTML += `<tr><th style="background-color:${color}">${nodos.get(id).label}</th>`;
            let sumaFila = 0;
            nodosIds.forEach((idInterno, index) => {
                const valor = matriz[id][idInterno];
                cuerpoHTML += `<td>${valor}</td>`;
                sumaTotalColumnas[index] += valor; // Suma el valor actual al total de la columna
                sumaFila += valor;
            });
            const colorSuma = esNodoFinal && sumaFila === 0 ? colorFinal : '';
            cuerpoHTML += `<td style="background-color:${colorSuma}">${sumaFila}</td></tr>`;            
        });
    
        // Agregar la última fila para las sumas de las columnas
        cuerpoHTML += '<tr><th>Suma</th>';
        sumaTotalColumnas.forEach((sumaColumna, index) => {
            const esNodoInicial = nodosIds[index] === nodoInicial;
            const color = esNodoInicial ? colorInicio : '';
            cuerpoHTML += `<td style="background-color:${color}">${sumaColumna}</td>`;
        });
        const sumaTotal = sumaTotalColumnas.reduce((acc, current) => acc + current, 0); // Calcular la suma total de las columnas
        cuerpoHTML += `<td>${sumaTotal}</td></tr>`; // La suma total al final
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

    document.getElementById('guardarBtn').addEventListener('click', function() {
        // Alternar la visualización del contenedor de opciones de exportación
        const exportOptions = document.getElementById('exportOptions');
        exportOptions.style.display = exportOptions.style.display === 'none' ? 'block' : 'none';
        // Posicionamiento debajo del botón Exportar, si es necesario
        const rect = this.getBoundingClientRect();
        exportOptions.style.left = rect.left + 'px';
        exportOptions.style.top = (rect.top + rect.height) + 'px';
    });

    exportPNG.addEventListener('click', function() { // Se apreta el botón de exportar como PNG
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.png");
        exportarComoPNG(nombreArchivo);
        exportOptions.style.display = 'none';
    });

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

    document.getElementById('rutaCriticaBtn').addEventListener('click', function() {
        const rutaOptions = document.getElementById('rutaOptions');
        rutaOptions.style.display = rutaOptions.style.display === 'none' ? 'block' : 'none';
    
        // Aseguramos que el contenedor esté posicionado correctamente debajo del botón "Ruta Crítica"
        const rect = this.getBoundingClientRect();
        rutaOptions.style.left = rect.left + 'px';
        rutaOptions.style.top = (rect.top + rect.height) + 'px';
    });
    // Manejador para el botón de aplicar color de ruta crítica
    document.getElementById('aplicarColorRutaCritica').addEventListener('click', function() {
        const colorRuta = document.getElementById('colorRutaCritica');
        destacarRutaCritica(colorRuta.value);
        const nodosIniciales = nodos.getIds().filter(id => aristas.get({
            filter: arista => arista.to === id
        }).length === 0);

        const nodosFinales = nodos.getIds().filter(id => aristas.get({
            filter: arista => arista.from === id
        }).length === 0);

        // Verificar que solo haya un nodo inicial y un nodo final
        if (nodosIniciales.length !== 1 || nodosFinales.length !== 1) {
            alert('Debe haber un único nodo de inicio y un único nodo final para calcular la ruta crítica.');
            return;
        }
        document.getElementById('rutaOptions').style.display = 'none';
    });

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