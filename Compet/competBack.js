document.addEventListener('DOMContentLoaded', function() {
    const grafoContainer = document.getElementById('grafo-container');
    const matrizContainer = document.getElementById('matriz-container');
    const matrizHeader = document.getElementById('matriz-header');
    const matrizBody = document.getElementById('matriz-body');
    const exportarBtn = document.getElementById('exportarBtn');
    const importarBtn = document.getElementById('importarBtn');
    const importarArchivo = document.getElementById('importarArchivo');
    const svg = d3.select(grafoContainer)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    let width, height;
    let xAxis, yAxis;
    let xAxisGroup, yAxisGroup;

    function updateDimensions() {
        width = grafoContainer.offsetWidth;
        height = grafoContainer.offsetHeight;

        xAxis = d3.scaleLinear()
            .domain([-50, 50]) // Rango de -50 a 50 para centrar en 0
            .range([0, width]);

        yAxis = d3.scaleLinear()
            .domain([-50, 50]) // Rango de -50 a 50 para centrar en 0
            .range([height, 0]);

        xAxisGroup = svg.append("g")
            .attr("transform", `translate(0,${height / 2})`) // Centrar en la mitad de la altura
            .call(d3.axisBottom(xAxis));

        yAxisGroup = svg.append("g")
            .attr("transform", `translate(${width / 2},0)`) // Centrar en la mitad del ancho
            .call(d3.axisLeft(yAxis));

        xAxisGroup.selectAll(".tick line")
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        yAxisGroup.selectAll(".tick line")
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        xAxisGroup.selectAll(".tick text")
            .attr("fill", "white");

        yAxisGroup.selectAll(".tick text")
            .attr("fill", "white");

        svg.append("line")
            .attr("x1", width / 2)
            .attr("y1", 0)
            .attr("x2", width / 2)
            .attr("y2", height)
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        svg.append("line")
            .attr("x1", 0)
            .attr("y1", height / 2)
            .attr("x2", width)
            .attr("y2", height / 2)
            .attr("stroke", "white")
            .attr("stroke-width", 1);
    }

    updateDimensions();

    window.addEventListener('resize', updateDimensions);

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

    function exportarGrafo(nombreArchivo) {
        // Construir el objeto de datos para exportar
        const data = {
            nodos: [],
            conexiones: conexiones
        };
    
        // Obtener la información de cada nodo
        svg.selectAll("circle").each(function() {
            const nodo = d3.select(this);
            const id = nodo.attr("id");
            const nombre = nodo.attr("data-nombre"); // Obtener el nombre del nodo
            const x = parseFloat(nodo.attr("cx")); // Coordenada escalada para SVG
            const y = parseFloat(nodo.attr("cy")); // Coordenada escalada para SVG
            const originalX = parseFloat(nodo.attr("data-x")); // Coordenada original
            const originalY = parseFloat(nodo.attr("data-y")); // Coordenada original
    
            // Verificar si las coordenadas son números válidos
            if (!isNaN(x) && !isNaN(y)) {
                data.nodos.push({ id, nombre, x, y, originalX, originalY }); // Agregar el nombre del nodo
            }
        });
    
        // Convertir el objeto de datos a JSON
        const jsonData = JSON.stringify(data);
    
        // Crear un enlace de descarga para el archivo JSON
        const enlace = document.createElement('a');
        enlace.download = nombreArchivo || 'grafo.json';
        enlace.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonData);
        enlace.click();
    }
    
    function importarGrafo(event) {
        const archivo = event.target.files[0];
        const lector = new FileReader();
        lector.onload = function(e) {
            // Parsear el archivo JSON
            const data = JSON.parse(e.target.result);
    
            // Limpiar el lienzo
            svg.selectAll("*").remove();
    
            // Objeto para almacenar las conexiones entre nodos
            conexiones = {};
    
            // Recrear los nodos
            data.nodos.forEach(nodo => {
                const nuevoNodo = svg.append("circle")
                    .attr("id", nodo.id) // Utilizar el ID original
                    .attr("data-nombre", nodo.nombre) // Utilizar el nombre del nodo
                    .attr("cx", nodo.x)
                    .attr("cy", nodo.y)
                    .attr("r", 8)
                    .attr("fill", "blue")
                    .on("click", function() {
                        if (nodoOrigen === null) {
                            nodoOrigen = this;
                        } else {
                            conectarNodos(nodoOrigen, this);
                            nodoOrigen = null;
                        }
                    })
                    .on("contextmenu", function() {
                        event.preventDefault();
                        // Eliminar el nodo y sus conexiones
                        const id = d3.select(this).attr("id");
                        const lineas = svg.selectAll("line");
                        lineas.each(function() {
                            if (
                                this.getAttribute("x1") === d3.select(`#${id}`).attr("cx") ||
                                this.getAttribute("x2") === d3.select(`#${id}`).attr("cx") ||
                                this.getAttribute("y1") === d3.select(`#${id}`).attr("cy") ||
                                this.getAttribute("y2") === d3.select(`#${id}`).attr("cy")
                            ) {
                                this.remove();
                            }
                        });
                        svg.select(`#${id}-text`).remove();
                        this.remove();
                        delete conexiones[id];
                    });
    
                svg.selectAll("circle").raise(); // Asegurar que los nodos estén dibujados sobre las líneas
    
                // Agregar el texto asociado al nodo con el nombre correspondiente
                svg.append("text")
                    .attr("id", `${nodo.id}-text`)
                    .attr("x", nodo.x + 15)
                    .attr("y", nodo.y - 15)
                    .attr("fill", "white")
                    .style("font-size", "13px") // Tamaño de fuente más pequeño
                    .text(`${nodo.nombre} (${nodo.originalX}, ${nodo.originalY})`); // Utilizar el nombre y las coordenadas originales aquí
    
                // Inicializar las conexiones del nodo
                conexiones[nodo.id] = [];
            });
    
            // Recrear las conexiones entre nodos
            Object.keys(data.conexiones).forEach(idOrigen => {
                data.conexiones[idOrigen].forEach(idDestino => {
                    const nodoOrigen = document.getElementById(idOrigen);
                    const nodoDestino = document.getElementById(idDestino);
                    if (nodoOrigen && nodoDestino) {
                        conectarNodos(nodoOrigen, nodoDestino);
                    }
                });
            });
    
            // Actualizar las dimensiones del plano de coordenadas después de importar
            updateDimensions();
        };
    
        lector.readAsText(archivo);
    }
    
    
    
    
    // Asignar la función importarGrafo al evento change del input de importación
    importarArchivo.addEventListener('change', importarGrafo);
    
    // Asignar la función exportarGrafo al evento click del botón de exportar JSON
    exportJSON.addEventListener('click', function() {
        let nombreArchivo = prompt("Ingrese el nombre del archivo:", "grafo.json");
        exportarGrafo(nombreArchivo);
    });

    guardarBtn.addEventListener('click', function() { // Se apreta el botón de exportar
        exportOptions.style.display = 'block';
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


    cargarBtn.addEventListener('click', () => importarArchivo.click()); // Se apreta el botón de importar



    document.getElementById('limpiarBtn').addEventListener('click', function() { // Limpiar grafo completo y actualizar matriz
        location.reload(); // Refrescar la página
    });

    let contadorNodos = 0; // Contador para llevar el orden de los nodos agregados
    let nodoOrigen = null;
    let conexiones = {}; // Objeto para almacenar las conexiones entre nodos

    function conectarNodos(nodoOrigen, nodoDestino) {
        const x1 = parseFloat(nodoOrigen.getAttribute("cx"));
        const y1 = parseFloat(nodoOrigen.getAttribute("cy"));
        const x2 = parseFloat(nodoDestino.getAttribute("cx"));
        const y2 = parseFloat(nodoDestino.getAttribute("cy"));
    
        // Añadir la línea después de los nodos para que estén dibujados sobre las líneas
        const linea = svg.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "white")
            .attr("stroke-width", 2);
    
        // Almacenar la conexión entre nodos
        const idNodoOrigen = nodoOrigen.getAttribute("id");
        const idNodoDestino = nodoDestino.getAttribute("id");
        conexiones[idNodoOrigen] = conexiones[idNodoOrigen] || [];
        conexiones[idNodoDestino] = conexiones[idNodoDestino] || [];
        conexiones[idNodoOrigen].push(idNodoDestino);
        conexiones[idNodoDestino].push(idNodoOrigen);
    
        // Asegurar que los nodos estén dibujados sobre las líneas
        svg.selectAll("circle").raise();
    }
    
    document.getElementById('agregarBtn').addEventListener('click', function() {
        const nombreNodo = prompt("Ingrese el nombre del nodo:");
        const xCoord = parseFloat(prompt("Ingrese la coordenada en el eje X (entre -50 y 50):"));
        const yCoord = parseFloat(prompt("Ingrese la coordenada en el eje Y (entre -50 y 50):"));
    
        if (isNaN(xCoord) || isNaN(yCoord) || xCoord < -50 || xCoord > 50 || yCoord < -50 || yCoord > 50) {
            alert("Por favor, ingrese coordenadas válidas dentro del rango (-50, 50).");
            return;
        }
    
        const contador = ++contadorNodos; // Incrementar el contador de nodos
        const nombreVariable = nombreNodo || `nodo${contador}`; // Utilizar el nombre proporcionado o generar uno
        const nodoId = `nodo${contador}`; // Crear un identificador único para el nodo
        const nodo = svg.append("circle")
            .attr("id", nodoId) // Asignar un id único al nodo
            .attr("data-nombre", nombreNodo) // Guardar el nombre del nodo
            .attr("cx", xAxis(xCoord))
            .attr("cy", yAxis(yCoord))
            .attr("data-x", xCoord) // Guardar coordenada original
            .attr("data-y", yCoord) // Guardar coordenada original
            .attr("r", 8)
            .attr("fill", "blue")
            .on("click", function() {
                if (nodoOrigen === null) {
                    nodoOrigen = this;
                } else {
                    conectarNodos(nodoOrigen, this);
                    nodoOrigen = null;
                }
            })
            .on("contextmenu", function() {
                event.preventDefault();
    
                // Eliminar el nodo
                this.remove();
                // Eliminar las líneas conectadas a este nodo
                svg.selectAll("line").each(function() {
                    if (this.getAttribute("x1") === nodo.attr("cx") && this.getAttribute("y1") === nodo.attr("cy")) {
                        this.remove();
                    }
                    if (this.getAttribute("x2") === nodo.attr("cx") && this.getAttribute("y2") === nodo.attr("cy")) {
                        this.remove();
                    }
                });
                // Eliminar el texto asociado al nodo
                svg.select(`#${nodoId}-text`).remove();
            });
    
        // Ajustar el orden de los elementos para asegurar que los nodos estén dibujados sobre las líneas
        svg.selectAll("circle").raise();
    
        // Agregar el nombre de la variable y las coordenadas al lado del nodo
        svg.append("text")
            .attr("id", `${nodoId}-text`) // Asignar un id único al texto asociado al nodo
            .attr("x", xAxis(xCoord) + 15)
            .attr("y", yAxis(yCoord) - 15)
            .attr("fill", "white")
            .style("font-size", "13px") // Ajustar el tamaño de la fuente aquí
            .text(`${nombreVariable} (${xCoord}, ${yCoord})`);
    });
    

    document.getElementById('resolverBtn').addEventListener('click', function() {
        // Limpiar puntos rojos existentes
        svg.selectAll("circle.red-dot").remove();
    
        let sumX = 0;
        let sumY = 0;
        const nodos = svg.selectAll("circle");
        const nodosCoords = [];
        const puntosMedios = [];
    
        nodos.each(function() {
            const x = parseFloat(d3.select(this).attr("cx"));
            const y = parseFloat(d3.select(this).attr("cy"));
            const nombre = d3.select(this).attr("data-nombre"); // Obtener el nombre del nodo
            nodosCoords.push({x, y, nombre}); // Agregar el nombre del nodo al objeto de coordenadas
            sumX += x;
            sumY += y;
        });
    
        const numNodos = nodos.size();
        const centerX = sumX / numNodos;
        const centerY = sumY / numNodos;
    
        const centroidX = centerX / (width / 100) - 50;
        const centroidY = 50 - (centerY / (height / 100));
    
        // Agregar un punto rojo en el centro del grupo cerrado
        svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", 5)
        .attr("fill", "red")
        .classed("red-dot", true); // Marcar como punto rojo

    // Agregar texto con las coordenadas del centroide
    svg.append("text")
        .attr("x", centerX + 5)
        .attr("y", centerY - 5)
        .attr("fill", "white")
        .style("font-size", "13px") // Ajustar el tamaño de la fuente aquí
        .text(`${centroidX.toFixed(2)}, ${centroidY.toFixed(2)}`);

    // Actualizar el contenido del contenedor de información
    const infoContainer = document.getElementById('info-container');
    infoContainer.innerHTML = `<h3>Información de Coordenadas</h3>
                               <p>Centroide: (${centroidX.toFixed(2)}, ${centroidY.toFixed(2)})</p>
                               <h4>Coordenadas de Nodos:</h4>`;

    // Agregar coordenadas de nodos al contenedor de información y mostrar los puntos en el gráfico
    nodosCoords.forEach(coord => {
        const nodoX = coord.x / (width / 100) - 50;
        const nodoY = 50 - (coord.y / (height / 100)); // Invertir el eje Y
        infoContainer.innerHTML += `<p>${coord.nombre}: (${nodoX.toFixed(2)}, ${nodoY.toFixed(2)})</p>`;
    });

    // Calcular y mostrar las coordenadas de los puntos medios entre los nodos
    for (let i = 0; i < nodosCoords.length - 1; i++) {
        for (let j = i + 1; j < nodosCoords.length; j++) {
            const xMedio = (nodosCoords[i].x + nodosCoords[j].x) / 2;
            const yMedio = (nodosCoords[i].y + nodosCoords[j].y) / 2;
            const medioX = xMedio / (width / 100) - 50;
            const medioY = 50 - (yMedio / (height / 100)); // Invertir el eje Y
            puntosMedios.push({x: medioX, y: medioY});

            // Agregar coordenadas de punto medio al contenedor de información
            infoContainer.innerHTML += `<p>Punto Medio entre ${nodosCoords[i].nombre} y ${nodosCoords[j].nombre}: (${medioX.toFixed(2)}, ${medioY.toFixed(2)})</p>`;

            // Agregar un punto rojo en las coordenadas del punto medio
            svg.append("circle")
                .attr("cx", xMedio)
                .attr("cy", yMedio)
                .attr("r", 3)
                .attr("fill", "red")
                .classed("red-dot", true); // Marcar como punto rojo
        }
    }
});
    
});