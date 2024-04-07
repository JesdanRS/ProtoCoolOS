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

    async function merge(arr, l, m, r, ascendente = true) {
        const n1 = m - l + 1;
        const n2 = r - m;
        let L = new Array(n1);
        let R = new Array(n2);
    
        for (let i = 0; i < n1; i++)
            L[i] = arr[l + i];
        for (let j = 0; j < n2; j++)
            R[j] = arr[m + 1 + j];
    
        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            if (ascendente ? L[i] <= R[j] : L[i] >= R[j]) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            await dibujarGraficoBarras(arr, [k]);
            await sleep(50);
            k++;
        }
    
        while (i < n1) {
            arr[k] = L[i];
            await dibujarGraficoBarras(arr, [k]);
            await sleep(50);
            i++;
            k++;
        }
    
        while (j < n2) {
            arr[k] = R[j];
            await dibujarGraficoBarras(arr, [k]);
            await sleep(50);
            j++;
            k++;
        }
    }
    
    async function mergeSort(arr, l, r, ascendente = true) {
        if (l >= r) {
            return; //returns recursively
        }
        const m = l + parseInt((r - l) / 2);
        await mergeSort(arr, l, m, ascendente);
        await mergeSort(arr, m + 1, r, ascendente);
        await merge(arr, l, m, r, ascendente);
    }
    
    async function visualizarMergeSort(listaNumeros, ascendente = true) {
        let arr = [].concat(listaNumeros);
        let startTime = performance.now();
        await mergeSort(arr, 0, arr.length - 1, ascendente);
        let endTime = performance.now();
        let tiempoOrdenamiento = (endTime - startTime) / 1000;
        document.getElementById('tiempoOrdenamiento').textContent = tiempoOrdenamiento.toFixed(2);
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
        document.getElementById('tiempoOrdenamiento').textContent = "--";
        document.getElementById('listaOrdenada').textContent = "--";
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
        document.getElementById('tiempoOrdenamiento').textContent = "--";
        document.getElementById('listaOrdenada').textContent = "--";
    });

    // Actualización de los listeners para usar visualizarMergeSort
    ordenarBtn.addEventListener('click', async function() {
        await visualizarMergeSort(listaNumeros, true);
        actualizarResultado();
    });

    ordenarDesBtn.addEventListener('click', async function() {
        await visualizarMergeSort(listaNumeros, false);
        actualizarResultado();
    });

    limpiarBtn.addEventListener('click', function() {
        if (miGrafico) {
            miGrafico.destroy();
            miGrafico = null;
        }
        listaNumeros = [];
        document.getElementById('tiempoOrdenamiento').textContent = "--";
        document.getElementById('listaOriginal').textContent = "--"; // Limpia la lista original
        document.getElementById('listaOrdenada').textContent = "--";
        dibujarGraficoBarras(listaNumeros);
    });

    dibujarGraficoBarras(listaNumeros);
});
