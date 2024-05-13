document.addEventListener('DOMContentLoaded', function() {
    const pasos = [
        {
            elemento: document.getElementById('navMenu'),
            mensaje: 'Aquí puedes navegar a diferentes secciones de nuestro sitio.',
        },
        {
            elemento: document.getElementById('graficoContainer'),
            mensaje: 'Este es el área central de interacción donde puedes ver y editar los grafos.',
            posicionMedio: true,
        },
        {
            elemento: document.getElementById('cambiarColorBtn'),
            mensaje: 'Aquí puedes cambiar el color de los nodos seleccionados.',
        },
        {
            elemento: document.getElementById('cambiarColorTextoBtn'),
            mensaje: 'Aquí puedes cambiar el color del texto.',
        },
        {
            elemento: document.getElementById('cambiarColorAristaBtn'),
            mensaje: 'Aquí puedes cambiar el color de las aritas .',
        },
        {
            elemento: document.getElementById('eliminarBtn'),
            mensaje: 'Usa este botón para eliminar nodos o conexiones seleccionados.',
        },
        {
            elemento: document.getElementById('limpiarBtn'),
            mensaje: 'Limpia el lienzo y empieza de nuevo.',
        },
        {
            elemento: document.getElementById('guardarBtn'),
            mensaje: 'Guarda el estado actual de tu grafo aquí.',
        },
        {
            elemento: document.getElementById('cargarBtn'),
            mensaje: 'Carga un grafo previamente guardado.',
        },
        {
            elemento: document.getElementById('solMinBtn'),
            mensaje: 'Aplica el algoritmo al caso y se mostrará la minimización.',
        },
        {
            elemento: document.getElementById('solMaxBtn'),
            mensaje: 'Aplica el algoritmo al caso y se mostrará la maximización.',
        },
        {
            elemento: document.getElementById('volverColorOrig'),
            mensaje: 'Borra la solucion y plantea una nueva.',
        }

    ];
    let pasoActual = 0;

    function mostrarPaso(paso) {
        ocultarPasos();
        removerDesenfoque();
        aplicarDesenfoque();
        paso.elemento.style.position = 'relative'; // Importante para que z-index funcione
        paso.elemento.style.zIndex = '1006'; // Asegúrate de que esté por encima de la capa de desenfoque

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        // Agrega tu HTML de tooltip aquí
        tooltip.style.zIndex = '1006';
        tooltip.innerHTML = `<p>${paso.mensaje}</p><div style="margin-top: 10px;">`;

        if (pasoActual > 0) {
            tooltip.innerHTML += `<button onclick="anteriorPaso()" style="margin-right: 5px;"><span style="margin-right: 5px;">←</span></button>`;
        }

        if (pasoActual < pasos.length - 1) {
            tooltip.innerHTML += `<button onclick="siguientePaso()"><span style="margin-left: 5px;">✓</span></button>`;
        } else {
            tooltip.innerHTML += `<button onclick="finalizarTutorial()"><span style="margin-left: 5px;">✓</span></button>`;
        }
        if (pasoActual === 1) { // Recordando que los índices comienzan en 0
            agregarBotonVideo(paso.elemento);
        }
        tooltip.innerHTML += `</div>`;
        document.body.appendChild(tooltip);

        ajustarZIndex(paso.elemento, tooltip);


        const rect = paso.elemento.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY}px`;

        if (paso.posicionMedio) {
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2 - tooltip.offsetHeight / 2}px`;
        }
        const botonExistente = document.getElementById('botonVideo');
        if (botonExistente) {
            botonExistente.remove(); // Eliminar el botón existente antes de crear uno nuevo
        }
        
        paso.elemento.classList.add('resaltar');
        aplicarDesenfoque();
    }
    function agregarBotonVideo(tooltip) {
        const botonVideo = document.createElement('button');
        botonVideo.id = 'botonVideo'; // Agregar un ID para referencia de estilos CSS
        botonVideo.classList.add('boton-resplandor'); // Clase para animación de resplandor
        
        // Crear el ícono de video y añadirlo al botón
        const iconoVideo = document.createElement('i');
        iconoVideo.className = 'bx bxs-videos'; // Usa la clase del icono de Boxicons
        iconoVideo.style.color = 'white'; // Color del ícono
        iconoVideo.style.fontSize = '30px'; // Tamaño del ícono
    
        botonVideo.appendChild(iconoVideo);
    
        botonVideo.onclick = function() {
            reproducirVideo();
        };

    
        tooltip.appendChild(botonVideo); // Añade el botón al tooltip en lugar de al body
    }
    
    
    function reproducirVideo() {
        // Obtén el tooltip actual por su clase o ID
        const tooltip = document.querySelector('.tooltip');
    
        // Crea el contenedor para el video si aún no existe
        let videoContainer = document.getElementById('videoContainer');
        if (!videoContainer) {
            videoContainer = document.createElement('div');
            videoContainer.id = 'videoContainer';
            videoContainer.style.position = 'fixed'; // O 'absolute' si el tooltip es parte de un contenedor posicionado
            videoContainer.style.zIndex = '1007'; // Asegúrate de que esté por encima del desenfoque
            videoContainer.style.left = '50%'; // Ajusta según la posición del tooltip en tu página
            videoContainer.style.top = '50%'; // Ajusta según la posición del tooltip en tu página
            videoContainer.style.transform = 'translate(-50%, -50%)'; // Centra el contenedor en la pantalla
            videoContainer.style.maxWidth = '70vw'; // Usa un máximo del 70% del ancho de la ventana
            videoContainer.style.maxHeight = '70vh'; // Usa un máximo del 70% del alto de la ventana
            document.body.appendChild(videoContainer);
        }
    
        // Vacía cualquier contenido anterior
        videoContainer.innerHTML = '';
    
        // Crea el elemento video y sus fuentes
        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true; // Esto inicia la reproducción automáticamente cuando se crea el elemento
        video.style.width = '100%'; // Hace que el video llene el contenedor
        video.style.height = '100%'; // Hace que el video llene el contenedor
        video.innerHTML = '<source src="VideoTutorialGrafos.mp4" type="video/mp4">Tu navegador no soporta videos HTML5.';
        
        // Añade el video al contenedor
        videoContainer.appendChild(video);
        // Crea un botón para cerrar el video
    const closeButton = document.createElement('button');
    closeButton.innerText = 'X'; // Puedes reemplazar esto con un ícono de cerrar si lo prefieres
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.zIndex = '1008'; // Asegúrate de que esté por encima del video
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';

    // Añade funcionalidad para cerrar el video
    closeButton.onclick = function() {
        videoContainer.remove(); // Elimina el contenedor de video
    };

    // Añade el botón de cierre al contenedor de video
    videoContainer.appendChild(closeButton);
    }
    
    
    function ocultarPasos() {
        document.querySelectorAll('.tooltip').forEach(tooltip => tooltip.remove());
        document.querySelectorAll('.resaltar').forEach(elemento => elemento.classList.remove('resaltar'));
        removerDesenfoque();
    }
    function ajustarZIndex(elemento, tooltip) {
        elemento.style.position = 'relative';
        elemento.style.zIndex = '1001';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '1001';
    }
    function aplicarDesenfoque() {
    // Asegúrate de que la capa de desenfoque esté al fondo de todos los elementos excepto el fondo mismo
    let capaDesenfoque = document.getElementById('capaDesenfoque');
    if (!capaDesenfoque) {
        capaDesenfoque = document.createElement('div');
        capaDesenfoque.id = 'capaDesenfoque';
        document.body.appendChild(capaDesenfoque);
    }
    capaDesenfoque.style.zIndex = "998"; // Asegura que esto sea menor que el tooltip y resaltar pero mayor que el fondo
    capaDesenfoque.style.position = 'fixed';
    capaDesenfoque.style.width = '100vw';
    capaDesenfoque.style.height = '100vh';
    capaDesenfoque.style.top = '0';
    capaDesenfoque.style.left = '0';
    capaDesenfoque.style.background = 'rgba(0,0,0,0.5)';
    capaDesenfoque.style.backdropFilter = 'blur(4px)';
}

    function removerDesenfoque() {
        const capaDesenfoque = document.getElementById('capaDesenfoque');
        if (capaDesenfoque) {
            capaDesenfoque.remove();
        }
    }

    window.anteriorPaso = function() {
        if (pasoActual > 0) {
            pasoActual--;
            mostrarPaso(pasos[pasoActual]);
        }
    };

    window.siguientePaso = function() {
        if (pasoActual < pasos.length - 1) {
            pasoActual++;
            mostrarPaso(pasos[pasoActual]);
        }
    };

    window.finalizarTutorial = function() {
        ocultarPasos();
        removerDesenfoque();
        pasoActual = 0;
        alert('Fin del tutorial. Gracias por participar.');
    };

    document.getElementById('helpBtn').addEventListener('click', function() {
        mostrarPaso(pasos[pasoActual]);
    });
});