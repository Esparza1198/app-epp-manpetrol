const URL_google = "https://script.google.com/macros/s/AKfycbxTI0oiYYAxceMeQQsqHqpQKqSAuLoHYGpPlpEZ0ls35tT9HmXOj0jeWXHNVBIfr0NGNg/exec";


const cantidadAgregar = document.getElementById('cant_material');
const botonAgregar = document.getElementById('boton_2');
// 1. Variables separadas para almacenar los datos
let datosPersonas = [];
let datosMateriales = [];

// 2. Cargamos ambos datos al iniciar
async function obtenerTodosLosDatos() {
    try {
        // Traemos personas (pestaña=personas debe coincidir con tu Apps Script)
        const resPers = await fetch(`${URL_google}?pestaña=personas`);
        datosPersonas = await resPers.json();

        // Traemos materiales (pestaña=materiales debe coincidir con tu Apps Script)
        const resMat = await fetch(`${URL_google}?pestaña=materiales`);
        datosMateriales = await resMat.json();

        console.log("Todos los datos cargados correctamente");
    } catch (error) {
        console.error("Error al leer el Excel:", error);
    }
}

obtenerTodosLosDatos();

// --- LÓGICA PARA PERSONAS ---

function filtrarPersonas() {
    const input = document.getElementById('busq_personas');
    const contenedor = document.getElementById('visualizadorPersonas');
    const texto = input.value.toLowerCase();

    if (texto === "") {
        contenedor.innerHTML = "";
        return;
    }

    const coincidencias = datosPersonas.filter(f =>
        String(f.legajo).toLowerCase().includes(texto) ||
        String(f.nombreApellido).toLowerCase().includes(texto) ||
        String(f.dni).toLowerCase().includes(texto)
    );

    contenedor.innerHTML = coincidencias.map(p => `
        <button type="button" class="list-group-item list-group-item-action" 
                onclick="seleccionarPersona('${p.legajo}', '${p.nombreApellido}', '${p.dni}', '${p.funcion}')"> 
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${p.nombreApellido}</h6>
                <small class="text-primary fw-bold">Legajo: ${p.legajo}</small>
            </div>
            <small class="text-muted">DNI: ${p.dni}</small>
        </button>
    `).join('');
}

let personaSeleccionada = null;

function seleccionarPersona(legajo, nombre, dni, funcion) { // <-- Agregamos "funcion" como parámetro
    // Guardamos los datos en nuestra variable global
    personaSeleccionada = {
        legajo: legajo,
        nombre: nombre,
        dni: dni,
        funcion: funcion // <-- NUEVO: Guardamos la función en la memoria
    };

    document.getElementById('busq_personas').value = `${nombre} (Legajo: ${legajo})`;
    document.getElementById('visualizadorPersonas').innerHTML = "";
}

// --- LÓGICA PARA MATERIALES ---

function filtrarMateriales() {
    const input = document.getElementById('busq_materiales');
    const contenedor = document.getElementById('visualizadorMateriales');
    const texto = input.value.toLowerCase();

    if (texto === "") {
        contenedor.innerHTML = "";
        return;
    }

    const coincidencias = datosMateriales.filter(f =>
        String(f.material).toLowerCase().includes(texto) ||
        String(f.modelo).toLowerCase().includes(texto) ||
        String(f.marca).toLowerCase().includes(texto)
    );

    contenedor.innerHTML = coincidencias.map(m => `
        <button type="button" class="list-group-item list-group-item-action" 
                onclick="seleccionarMaterial('${m.material}', '${m.modelo}', '${m.marca}')">
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${m.material}</h6>
                <small class="text-success fw-bold">${m.marca}</small>
            </div>
            <small class="text-muted">Modelo: ${m.modelo}</small>
        </button>
    `).join('');
}

// 1. Variable global para el material (la "memoria")
let materialSeleccionado = null;

// 2. Función para seleccionar el material
function seleccionarMaterial(material, modelo, marca) {
    // Guardamos los datos en la variable global como un objeto
    materialSeleccionado = {
        material: material,
        modelo: modelo,
        marca: marca
    };

    // Reflejamos la selección en el input de materiales
    document.getElementById('busq_materiales').value = `${material} - ${marca} (${modelo})`;

    // Limpiamos la lista de sugerencias de materiales
    document.getElementById('visualizadorMateriales').innerHTML = "";

    console.log("Material guardado en memoria:", materialSeleccionado);
}



botonAgregar.addEventListener('click', () => {

    let cantidad = cantidadAgregar.value;

    if (personaSeleccionada && materialSeleccionado) {

        const cuerpoTabla = document.getElementById('cuerpoTabla');
        const nuevaFila = `
        <tr onclick="marcarFila(this)" style="cursor:pointer;">
            <td>${personaSeleccionada.nombre}</td>
            <td>${materialSeleccionado.material}</td>
            <td>${materialSeleccionado.modelo}</td>
            <td>${materialSeleccionado.marca}</td>
            <td>${cantidad}</td>
            <td>${new Date().toLocaleDateString()}</td>
        </tr>
        `;
        if (cuerpoTabla.innerHTML.includes('&nbsp;')) {
            cuerpoTabla.innerHTML = "";
        }

        cuerpoTabla.innerHTML += nuevaFila;
        document.getElementById('busq_materiales').value = "";
        cantidadAgregar.value = "";

        console.log("fila agregada con exito");
    } else {
        alert("¡Error! Primero debes seleccionar una persona.");
    }

});

function marcarFila(fila) {
    const todasLasFilas = document.querySelectorAll('#cuerpoTabla tr');

    todasLasFilas.forEach(f => f.classList.remove('fila-seleccionada'));

    fila.classList.add('fila-seleccionada');
}

const botonBorrar = document.getElementById('boton_4');

botonBorrar.addEventListener('click', () => {

    // 1. Buscamos la fila que tiene la clase de selección
    const filaParaBorrar = document.querySelector('#cuerpoTabla tr.fila-seleccionada');

    // 2. Verificamos si realmente hay una fila seleccionada
    if (filaParaBorrar) {

        // Confirmación opcional para evitar accidentes
        if (confirm("¿Estás seguro de que deseas eliminar esta fila?")) {

            // 3. Eliminamos la fila
            filaParaBorrar.remove();

            console.log("Fila eliminada correctamente");
        }

    } else {
        // Si no encontró ninguna fila con esa clase
        alert("Por favor, selecciona una fila de la tabla primero haciendo clic sobre ella.");
    }
});

// Seleccionamos el nuevo ID del Switch
const checkbox = document.getElementById('switchCheckDefault');
const contenedorSup = document.getElementById('contenedorSupervisor');

// 1. Lógica para expandir el input del Supervisor
checkbox.addEventListener('change', function() {
    if (this.checked) {
        contenedorSup.classList.add('expandible-visible');
    } else {
        contenedorSup.classList.remove('expandible-visible');
        document.getElementById('inputSupervisor').value = ""; 
    }
});

const btnImprimir = document.getElementById('boton_1');

btnImprimir.addEventListener('click', async () => {
    const filas = document.querySelectorAll('#cuerpoTabla tr');
    const filasConDatos = Array.from(filas).filter(f => !f.innerHTML.includes('&nbsp;'));

    if (filasConDatos.length === 0) return alert("No hay datos en la tabla");

    // Referencias a los elementos
    const checkboxDevuelto = document.getElementById('switchCheckDefault'); 
    const supervisorInput = document.getElementById('inputSupervisor');

    const estadoCheckbox = checkboxDevuelto ? checkboxDevuelto.checked : false;
    
    // Si el check está activo, toma el nombre del supervisor, si no, envía "N/A"
    const nombreSupervisor = (estadoCheckbox && supervisorInput) ? supervisorInput.value : "N/A";

    const datosParaEnviar = {
        persona: personaSeleccionada,
        devolvioFirmada: estadoCheckbox, 
        supervisor: nombreSupervisor, 
        listaMateriales: filasConDatos.map(fila => {
            const celdas = fila.querySelectorAll('td');
            return {
                material: celdas[1].innerText,
                modelo: celdas[2].innerText,
                marca: celdas[3].innerText,
                cantidad: celdas[4].innerText,
                fecha: celdas[5].innerText
            };
        })
    };

    const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxTI0oiYYAxceMeQQsqHqpQKqSAuLoHYGpPlpEZ0ls35tT9HmXOj0jeWXHNVBIfr0NGNg/exec";
    const ID_SHEET = "1XOV3I6z5eZLZFuhdiG_0UVMMPXipo09hGREMUwkAk7A";
    const GID_HOJA = "1882310702";

    try {
        await fetch(URL_SCRIPT, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(datosParaEnviar)
        });

        // Abrir PDF de Hoja 3 (que no tiene el dato del supervisor)
        const urlImpresion = `https://docs.google.com/spreadsheets/d/${ID_SHEET}/export?` +
            `format=pdf&size=A4&portrait=true&fitw=true&` + 
            `gridlines=false&sheetnames=false&printtitle=false&` +
            `gid=${GID_HOJA}&attachment=false`;

        window.open(urlImpresion, '_blank');

    } catch (error) {
        alert("Error de conexión");
        console.error(error);
    }
});