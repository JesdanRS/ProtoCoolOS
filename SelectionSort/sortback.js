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
        let tiempoOrdenamiento = endTime - startTime; // Calcula la diferencia
        document.getElementById('tiempoOrdenamiento').textContent = tiempoOrdenamiento.toFixed(2); // Muestra el tiempo en el elemento del DOM
    }

    function dibujarGraficoBarras(datos, highlightIndexes = []) {
        const ctx = document.getElementById('graficoBarras').getContext('2d');
        if (miGrafico) {
            miGrafico.destroy();
        }
        miGrafico = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map((_, i) => `Número ${i + 1}`),
                datasets: [{
                    label: 'Valor',
                    data: datos,
                    backgroundColor: datos.map((_, i) => highlightIndexes.includes(i) ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.2)'),
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 0 // desactivar la animación estándar de Chart.js para la actualización de datos
                },
            }
        });
    }

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
    });

    limpiarBtn.addEventListener('click', function() {
        if (miGrafico) {
            miGrafico.destroy();
            miGrafico = null;
        }
        listaNumeros = [];
        document.getElementById('tiempoOrdenamiento').textContent = "";
    });

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
});
