document.addEventListener('DOMContentLoaded', function() {
    const agregarListaBtn = document.getElementById('agregarListaBtn');
    const listaRandomBtn = document.getElementById('listaRandomBtn');
    const ordenarBtn = document.getElementById('ordenarBtn');
    const limpiarBtn = document.getElementById('limpiarBtn');
    let miGrafico;
    let listaNumeros = [];

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function visualizarSelectionSort(arr) {
        let startTime = performance.now(); // Captura el tiempo de inicio
    
        for (let i = 0; i < arr.length - 1; i++) {
            let min = i;
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[min]) {
                    min = j;
                }
                dibujarGraficoBarras(arr, [min, j]);
                await sleep(100); // Pausa para visualización
            }
            if (min !== i) {
                [arr[i], arr[min]] = [arr[min], arr[i]];
                dibujarGraficoBarras(arr, [i, min]);
                await sleep(100); // Pausa para visualización
            }
        }
    
        let endTime = performance.now(); // Captura el tiempo de finalización
        let tiempoOrdenamiento = (endTime - startTime) / 1000; // Calcula la diferencia y convierte a segundos
        document.getElementById('tiempoOrdenamiento').textContent = tiempoOrdenamiento.toFixed(2); // Muestra el tiempo en el elemento del DOM
        document.getElementById('listaOrdenada').textContent = arr.join(", ");
    }

    function actualizarResultado() {
        let listaOrdenadaHTML = listaNumeros.join(", ");
        let tiempoFinal = (performance.now() - tiempoInicio) / 1000;
        resultadoContainer.innerHTML = `
            <p>Tiempo de Ordenamiento: ${tiempoFinal.toFixed(2)} Segundos</p>
            <p>Lista Original: ${listaOriginalHTML}</p>
            <p>Lista Ordenada: ${listaOrdenadaHTML}</p>
        `;
        resultadoContainer.style.display = 'block'; // Muestra el contenedor con los resultados
    }

    async function visualizarSelectionSort(arr) {
        let startTime = performance.now(); // Captura el tiempo de inicio
    
        for (let i = 0; i < arr.length - 1; i++) {
            let min = i;
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[min]) {
                    min = j;
                }
                dibujarGraficoBarras(arr, [min, j]);
                await sleep(100); // Pausa para visualización
            }
            if (min !== i) {
                [arr[i], arr[min]] = [arr[min], arr[i]];
                dibujarGraficoBarras(arr, [i, min]);
                await sleep(100); // Pausa para visualización
            }
        }
    
        let endTime = performance.now(); // Captura el tiempo de finalización
        let tiempoOrdenamiento = (endTime - startTime) / 1000; // Calcula la diferencia y convierte a segundos
        document.getElementById('tiempoOrdenamiento').textContent = tiempoOrdenamiento.toFixed(2); // Muestra el tiempo en el elemento del DOM
        document.getElementById('listaOrdenada').textContent = arr.join(", ");
    }

    function dibujarGraficoBarras(datos, highlightIndexes = []) {
        const ctx = document.getElementById('graficoBarras').getContext('2d');
        if (miGrafico) {
            miGrafico.destroy();
        }
        miGrafico = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map((_, i) => `${i + 1}`),
                datasets: [{
                    label: '', // Se deja el label vacío o se quita completamente esta línea
                    data: datos,
                    backgroundColor: datos.map((_, i) => highlightIndexes.includes(i) ?  '#6bcff4' : '#581790'), //#7e22ce
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        grid: {
                            display: false, // Oculta la cuadrícula del eje X
                        },
                        ticks: {
                            color: 'white' // Color de los ticks (marcas) del eje X
                        },
                        axis: 'x',
                        borderColor: 'white' // Asegura que el borde del eje X sea visible
                    },
                    y: {
                        grid: {
                            display: false, // Oculta la cuadrícula del eje Y
                        },
                        ticks: {
                            color: 'white' // Color de los ticks (marcas) del eje Y
                        },
                        axis: 'y',
                        borderColor: 'white' // Asegura que el borde del eje Y sea visible
                    }
                },
                plugins: {
                    legend: {
                        display: false // Asegura que la leyenda esté desactivada
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    }
    
    /*function dibujarGraficoBarras(datos, highlightIndexes = []) {
        const svg = d3.select('#graficoBarrasContainer svg');
        svg.selectAll("*").remove();
    
        const margin = {top: 20, right: 20, bottom: 30, left: 40},
              width = +svg.attr("width") - margin.left - margin.right,
              height = +svg.attr("height") - margin.top - margin.bottom;
    
        const x = d3.scaleBand()
                    .range([0, width])
                    .padding(0.1)
                    .domain(datos.map((_, i) => i));
    
        const y = d3.scaleLinear()
                    .range([height, 0])
                    .domain([0, d3.max(datos, d => d)]);
    
        const g = svg.append("g")
                     .attr("transform", `translate(${margin.left},${margin.top})`);
    
        g.selectAll(".bar")
         .data(datos)
         .enter().append("rect")
           .attr("class", "bar")
           .attr("x", (d, i) => x(i))
           .attr("y", d => y(d))
           .attr("width", x.bandwidth())
           .attr("height", d => height - y(d))
           .attr("fill", (_, i) => highlightIndexes.includes(i) ? '#581790' : '#3b82f6')
           .on("mouseover", function(event, d) {
               const [x, y] = d3.pointer(event, svg.node());
    
               // Crear un grupo para el tooltip
               const tooltip = svg.append("g")
                                  .attr("id", "tooltip")
                                  .style("pointer-events", "none");
    
               // Agregar un rectángulo gris como fondo
               tooltip.append("rect")
                      .attr("x", x)
                      .attr("y", y - 30)
                      .attr("width", 60)
                      .attr("height", 20)
                      .attr("fill", "grey")
                      .attr("rx", 4) // bordes redondeados
                      .style("alignment-baseline", "middle");
    
               // Agregar texto mostrando el valor de la barra
               tooltip.append("text")
                      .attr("x", x + 30)
                      .attr("y", y - 15)
                      .attr("fill", "white")
                      .attr("text-anchor", "middle")
                      .text(d);
           })
           .on("mouseout", function() {
               svg.select("#tooltip").remove();
           });
    
        // Agregando ejes y cambiando su color a blanco
        g.append("g")
         .attr("transform", `translate(0,${height})`)
         .call(d3.axisBottom(x).tickFormat(i => i + 1))
         .selectAll("text")
         .style("color", "white");
    
        g.append("g")
         .call(d3.axisLeft(y))
         .selectAll("text")
         .style("color", "white");
    
        // Cambiar el color de las líneas de los ejes a blanco
        svg.selectAll("path.domain")
           .style("stroke", "white");
        svg.selectAll(".tick line")
           .style("stroke", "white");
    }*/    

    agregarListaBtn.addEventListener('click', function() {
        let cantidad = prompt('¿Cuántos números deseas agregar a la lista?');
        cantidad = parseInt(cantidad, 10);

        if (!isNaN(cantidad) && cantidad > 0) {
            listaNumeros = [];
            for (let i = 0; i < cantidad; i++) {
                let numero = prompt(`Ingresa el número ${i + 1}:`);
                numero = parseInt(numero, 10);

                if (!isNaN(numero)) {
                    listaNumeros.push(numero);
                } else {
                    alert(`El valor ingresado '${numero}' no es un número. Se interrumpe la adición de números.`);
                    return;
                }
            }
            document.getElementById('listaOriginal').textContent = listaNumeros.join(", ");
            dibujarGraficoBarras(listaNumeros);
        } else {
            alert('La cantidad debe ser un número mayor a cero.');
        }
    });

    /*const listaRandomBtn = document.getElementById('listaRandomBtn');*/

    listaRandomBtn.addEventListener('click', function() {
        const cantidad = prompt('¿Cuántos números aleatorios deseas generar?');
        const cantidadNumeros = parseInt(cantidad);

        if (!isNaN(cantidadNumeros) && cantidadNumeros > 0) {
            const rangoMin = prompt('Introduce el valor mínimo del rango:');
            const rangoMax = prompt('Introduce el valor máximo del rango:');
            const min = parseInt(rangoMin);
            const max = parseInt(rangoMax);

            if (!isNaN(min) && !isNaN(max) && min < max) {
                listaNumeros = []; // Reiniciamos la lista de números
                for (let i = 0; i < cantidadNumeros; i++) {
                    // Generamos números aleatorios dentro del rango especificado
                    const numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
                    listaNumeros.push(numeroAleatorio);
                }
                document.getElementById('listaOriginal').textContent = listaNumeros.join(", ");
                dibujarGraficoBarras(listaNumeros); // Dibujamos el gráfico con los números aleatorios
            } else {
                alert('Por favor, introduce un rango mínimo y máximo válido.');
            }
        } else {
            alert('Por favor, ingresa un número válido de elementos a generar.');
        }
    });

    ordenarBtn.addEventListener('click', async function() {
        await visualizarSelectionSort(listaNumeros);
        actualizarResultado();
    });

    limpiarBtn.addEventListener('click', function() {
        if (miGrafico) {
            miGrafico.destroy();
            miGrafico = null;
        }
        listaNumeros = [];
        document.getElementById('tiempoOrdenamiento').textContent = "";
        document.getElementById('listaOriginal').textContent = ""; // Limpia la lista original
        document.getElementById('listaOrdenada').textContent = ""; 
    });
});
