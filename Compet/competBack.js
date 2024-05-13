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
        const xCoord = parseInt(prompt("Ingrese la coordenada en el eje X (entre -50 y 50):"));
        const yCoord = parseInt(prompt("Ingrese la coordenada en el eje Y (entre -50 y 50):"));
    
        if (isNaN(xCoord) || isNaN(yCoord) || xCoord < -50 || xCoord > 50 || yCoord < -50 || yCoord > 50) {
            alert("Por favor, ingrese coordenadas válidas dentro del rango (-50, 50).");
            return;
        }
    
        const nodo = svg.append("circle")
            .attr("cx", xAxis(xCoord))
            .attr("cy", yAxis(yCoord))
            .attr("r", 10)
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
            });
    
        // Ajustar el orden de los elementos para asegurar que los nodos estén dibujados sobre las líneas
        svg.selectAll("circle").raise();
    });

    document.getElementById('resolverBtn').addEventListener('click', function() {
        // Calcular el centro del grupo cerrado
        let sumX = 0;
        let sumY = 0;
        const nodos = svg.selectAll("circle");
    
        nodos.each(function() {
            sumX += parseFloat(d3.select(this).attr("cx"));
            sumY += parseFloat(d3.select(this).attr("cy"));
        });
    
        const numNodos = nodos.size();
        const centerX = sumX / numNodos;
        const centerY = sumY / numNodos;
    
        // Agregar un punto rojo en el centro del grupo cerrado
        svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", 5)
            .attr("fill", "red");
    
        // Obtener todas las líneas que representan las conexiones entre nodos
        const lineas = svg.selectAll("line");
    
        // Iterar sobre cada línea para encontrar nodos asociados y calcular el punto medio
        lineas.each(function() {
            const nodo1 = svg.select(`circle[cx="${this.getAttribute("x1")}"][cy="${this.getAttribute("y1")}"]`);
            const nodo2 = svg.select(`circle[cx="${this.getAttribute("x2")}"][cy="${this.getAttribute("y2")}"]`);
    
            if (nodo1.size() !== 0 && nodo2.size() !== 0) { // Verificar si ambos nodos están presentes
                const xMedio = (parseFloat(nodo1.attr("cx")) + parseFloat(nodo2.attr("cx"))) / 2;
                const yMedio = (parseFloat(nodo1.attr("cy")) + parseFloat(nodo2.attr("cy"))) / 2;
    
                // Dibujar un punto rojo en el punto medio
                svg.append("circle")
                    .attr("cx", xMedio)
                    .attr("cy", yMedio)
                    .attr("r", 3)
                    .attr("fill", "red");
            }
        });
    });

    function mostrarResultado(resultado) {
        const resultadoContainer = document.getElementById('resultado-container');
        resultadoContainer.innerHTML = '<h3>Resultado:</h3>';
    
        const matrizAdyacencia = obtenerMatrizActual(); // Obtener la matriz de adyacencia
        
        // Obtener los nombres de las filas y columnas
        const nombresFilas = obtenerNombresFilas();
        const nombresColumnas = obtenerNombresColumnas();
    
        let sumaTotal = 0; // Inicializar la suma total de los costos de las asignaciones
        
        // Recorrer cada asignación en el resultado y mostrarla en el contenedor
        resultado.forEach(asignacion => {
            const filaNombre = nombresFilas[asignacion.row]; // Obtener el nombre de la fila
            const columnaNombre = nombresColumnas[asignacion.col]; // Obtener el nombre de la columna
            const costo = matrizAdyacencia[asignacion.row][asignacion.col]; // Obtener el costo de la asignación desde la matriz de adyacencia
            resultadoContainer.innerHTML += `<p>${filaNombre} se asigna a ${columnaNombre} con un valor de ${costo}</p>`;
    
            sumaTotal += costo; // Sumar el costo de esta asignación a la suma tota
        });
    
        // Mostrar la suma total de los costos de las asignaciones
        resultadoContainer.innerHTML += `<h4>Suma total de los costos de las asignaciones: ${sumaTotal}</h4>`;
        resultadoContainer.style.display = 'block'; // Mostrar el contenedor
    }
    
});