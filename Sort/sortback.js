document.addEventListener('DOMContentLoaded', function() {
    //DECLARACIONES
    const agregarListaBtn = document.getElementById('agregarListaBtn');
    const listaRandomBtn = document.getElementById('listaRandomBtn');
    const limpiarBtn = document.getElementById('limpiarBtn');
    let miGrafico;
    let listaNumeros = [];
    
    //MANEJO DE BOTONES
    const botonesSort = [
        { boton: document.getElementById('selectionBtn'), opciones: document.getElementById('selectionOptions') },
        { boton: document.getElementById('insertionBtn'), opciones: document.getElementById('insertionOptions') },
        { boton: document.getElementById('shellBtn'), opciones: document.getElementById('shellOptions') },
        { boton: document.getElementById('mergeBtn'), opciones: document.getElementById('mergeOptions') }
    ];

    function manejarVisibilidadOpciones(botonClickeado) {
        botonesSort.forEach(({ boton, opciones }) => {
            if (boton === botonClickeado) {
                const rect = boton.getBoundingClientRect();
                opciones.style.display = opciones.style.display === 'block' ? 'none' : 'block';
                opciones.style.top = `${rect.bottom + window.scrollY}px`; // Ajusta la posición vertical
                opciones.style.left = `${rect.left + window.scrollX}px`; // Ajusta la posición horizontal
            } else {
                opciones.style.display = 'none';
            }
        });
    }

    botonesSort.forEach(({ boton }) => {
        boton.addEventListener('click', (event) => {
            if (listaNumeros.length > 0){
                event.stopPropagation(); // Previene que el evento se propague
                manejarVisibilidadOpciones(boton);
            }else{
                alert('No se ha ingresado/generado ninguna lista de números.');
            }
        });
    });

    // Cerrar los paneles de opciones al hacer clic fuera de ellos
    document.addEventListener('click', () => {
        botonesSort.forEach(({ opciones }) => {
            opciones.style.display = 'none';
        });
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    //SELECTION SORT

    //INSERTION SORT
    async function visualizarInsertionSort(listaNumeros) {
        let arr = [].concat(listaNumeros);
        let startTime = performance.now(); // Captura el tiempo de inicio
    
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i];
            let j = i - 1;
    
            /* Mueve los elementos de arr[0..i-1], que son mayores que key,
               a una posición adelante de su posición actual */
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j = j - 1;
                dibujarGraficoBarras(arr, [j + 1, i]); // Visualizar el cambio
                await sleep(100); // Pausa para visualización
            }
            arr[j + 1] = key;
            dibujarGraficoBarras(arr); // Visualizar el cambio
            await sleep(100); // Pausa para visualización
        }
    
        let endTime = performance.now(); // Captura el tiempo de finalización
        let tiempoOrdenamiento = (endTime - startTime) / 1000; // Calcula la diferencia y convierte a segundos
        document.getElementById('tiempoOrdenamiento').textContent = tiempoOrdenamiento.toFixed(2); // Muestra el tiempo en el elemento del DOM
        document.getElementById('listaOrdenada').textContent = arr.join(", ");
    }

    async function visualizarInsertionSortDesc(listaNumeros) {
        let arr = [].concat(listaNumeros);
        let startTime = performance.now(); // Captura el tiempo de inicio
        
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i];
            let j = i - 1;
    
            // Mueve los elementos de arr[0..i-1] que son menores que
            // key a una posición adelante de su posición actual
            while (j >= 0 && arr[j] < key) {
                arr[j + 1] = arr[j];
                dibujarGraficoBarras(arr, [j + 1, j]); // Visualización de la posición que está siendo comparada
                await sleep(100); // Pausa para visualización
                j = j - 1;
            }
            arr[j + 1] = key;
            dibujarGraficoBarras(arr, [j + 1]); // Visualización de la inserción
            await sleep(100); // Pausa para visualización
        }
        
        let endTime = performance.now(); // Captura el tiempo de finalización
        let tiempoOrdenamiento = (endTime - startTime) / 1000; // Calcula la diferencia y convierte a segundos
        document.getElementById('tiempoOrdenamiento').textContent = tiempoOrdenamiento.toFixed(2); // Muestra el tiempo en el elemento del DOM
        document.getElementById('listaOrdenada').textContent = arr.join(", ");
    }

    //SHELL SORT
    async function visualizarShellSort(listaNumeros) {
        let n = listaNumeros.length;
        let gap = prompt('Introduce el valor inicial del gap:');
        gap = parseInt(gap, 10);
        
        let arr = [].concat(listaNumeros);
        let startTime = performance.now(); // Captura el tiempo de inicio
        
        for (gap; gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i += 1) {
                let temp = arr[i];
                let j;
                for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
                    arr[j] = arr[j - gap];
                    dibujarGraficoBarras(arr, [j, j - gap]); // Visualizar el cambio
                    await sleep(100); // Pausa para visualización
                }
                arr[j] = temp;
                dibujarGraficoBarras(arr); // Visualizar el cambio
                await sleep(100); // Pausa para visualización
            }
        }
        
        let endTime = performance.now(); // Captura el tiempo de finalización
        let tiempoOrdenamiento = (endTime - startTime) / 1000; // Calcula la diferencia y convierte a segundos
        document.getElementById('tiempoOrdenamiento').textContent = tiempoOrdenamiento.toFixed(2); // Muestra el tiempo en el elemento del DOM
        document.getElementById('listaOrdenada').textContent = arr.join(", ");
    }
    
    async function visualizarShellSortDesc(listaNumeros) {
        let n = listaNumeros.length;
        let gap = prompt('Introduce el valor inicial del gap:');
        gap = parseInt(gap, 10);
        
        let arr = [].concat(listaNumeros);
        let startTime = performance.now(); // Captura el tiempo de inicio
        
        for (gap; gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i += 1) {
                let temp = arr[i];
                let j;
                for (j = i; j >= gap && arr[j - gap] < temp; j -= gap) {
                    arr[j] = arr[j - gap];
                    dibujarGraficoBarras(arr, [j, j - gap]); // Visualizar el cambio
                    await sleep(100); // Pausa para visualización
                }
                arr[j] = temp;
                dibujarGraficoBarras(arr); // Visualizar el cambio
                await sleep(100); // Pausa para visualización
            }
        }
        
        let endTime = performance.now(); // Captura el tiempo de finalización
        let tiempoOrdenamiento = (endTime - startTime) / 1000; // Calcula la diferencia y convierte a segundos
        document.getElementById('tiempoOrdenamiento').textContent = tiempoOrdenamiento.toFixed(2); // Muestra el tiempo en el elemento del DOM
        document.getElementById('listaOrdenada').textContent = arr.join(", ");
    }

    //MERGE SORT
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

    //ACTUALIZAR CONTAINER RESULTADO Y GRÁFICO
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

    //EVENT LISTENERS BOTONES
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

    //LISTENERS SELECTION SORT


    //LISTENERS INSERTION SORT
    IordenarBtn.addEventListener('click', async function() {
        document.getElementById('tiempoOrdenamiento').textContent = "--";
        document.getElementById('listaOrdenada').textContent = "--";
        await visualizarInsertionSort(listaNumeros);
        actualizarResultado();
    });

    IordenarDesBtn.addEventListener('click', async function() {
        document.getElementById('tiempoOrdenamiento').textContent = "--";
        document.getElementById('listaOrdenada').textContent = "--";
        await visualizarInsertionSortDesc(listaNumeros);
        actualizarResultado();
    });

    //LISTENERS SHELL SORT
    SHordenarBtn.addEventListener('click', async function() {
        document.getElementById('tiempoOrdenamiento').textContent = "--";
        document.getElementById('listaOrdenada').textContent = "--";
        await visualizarShellSort(listaNumeros);
        actualizarResultado();
    });

    SHordenarDesBtn.addEventListener('click', async function() {
        document.getElementById('tiempoOrdenamiento').textContent = "--";
        document.getElementById('listaOrdenada').textContent = "--";
        await visualizarShellSortDesc(listaNumeros);
        actualizarResultado();
    });

    //LISTENERS MERGE SORT
    MordenarBtn.addEventListener('click', async function() {
        document.getElementById('tiempoOrdenamiento').textContent = "--";
        document.getElementById('listaOrdenada').textContent = "--";
        await visualizarMergeSort(listaNumeros, true);
        actualizarResultado();
    });

    MordenarDesBtn.addEventListener('click', async function() {
        document.getElementById('tiempoOrdenamiento').textContent = "--";
        document.getElementById('listaOrdenada').textContent = "--";
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
