
/**
 * ============================================================
 * BHC - BOMBEOS DE HORMIGÓN CASAS
 * Página web pública
 * ============================================================
 *
 * Funcionalidades:
 * - Configuración e información de contacto.
 * - Menú de navegación para dispositivos móviles.
 * - Calendario de disponibilidad de camiones.
 * - Consulta de camiones y reservas mediante Spring Boot.
 * - Envío de solicitudes de reserva mediante Formspree.
 * - Envío de mensajes de contacto mediante Formspree.
 * - Notificaciones para informar al usuario.
 *
 * IMPORTANTE:
 * El calendario es informativo. Una fecha disponible
 * no garantiza que el servicio pueda realizarse.
 *
 * El cliente envía una solicitud, pero la reserva
 * únicamente queda confirmada cuando la empresa
 * revisa y acepta el servicio.
 *
 * Backend: http://localhost:8080
 * ============================================================
 */


/* ============================================================
   1. CONFIGURACIÓN GENERAL
   ============================================================ */

/**
 * Información de la empresa.
 *
 * Sustituir los datos provisionales por los definitivos
 * antes de publicar la página web para clientes reales.
 */
const CONFIGURACION = {
  nombre: "Bombeos de Hormigon Casas",
  telefono: "983 00 00 00",
  email: "info@pluma47.es",
  zona: "Valladolid capital y provincia",

  // Dirección del backend durante el desarrollo local.
  apiUrl: "http://localhost:8080",
};


/* ============================================================
   2. DATOS DE CAMIONES Y RESERVAS
   ============================================================ */

/**
 * Estos arrays almacenan temporalmente los datos
 * recibidos desde Spring Boot.
 *
 * La fuente de información es la base de datos H2,
 * no el almacenamiento local del navegador.
 */
let camiones = [];
let reservas = [];

/**
 * Indica si hemos podido obtener los datos del backend.
 *
 * Si la conexión falla, no debemos mostrar días como
 * disponibles sin conocer las reservas existentes.
 */
let datosDisponibilidadCargados = false;


/* ============================================================
   3. COMUNICACIÓN CON SPRING BOOT
   ============================================================ */

/**
 * Obtiene los camiones y las reservas desde la API REST.
 *
 * Endpoint de camiones:
 * GET /camiones
 *
 * Endpoint de reservas:
 * GET /reservas
 *
 * @returns {Promise<boolean>}
 * true si se han obtenido ambos conjuntos de datos.
 * false si ha ocurrido algún error.
 */
async function obtenerDatosDisponibilidad() {
  // Mientras cargamos, no consideramos válidos
  // los datos anteriores.
  datosDisponibilidadCargados = false;

  try {
    // Solicitamos los camiones y las reservas.
    const [respuestaCamiones, respuestaReservas] =
      await Promise.all([
        fetch(`${CONFIGURACION.apiUrl}/camiones`),
        fetch(`${CONFIGURACION.apiUrl}/reservas`),
      ]);

    // Comprobamos las respuestas HTTP.
    if (!respuestaCamiones.ok || !respuestaReservas.ok) {
      throw new Error(
        "El servidor no ha podido proporcionar la disponibilidad."
      );
    }

    // Convertimos las respuestas JSON en arrays.
    const datosCamiones = await respuestaCamiones.json();
    const datosReservas = await respuestaReservas.json();

    // Comprobamos que la información recibida
    // tiene el formato esperado.
    if (
      !Array.isArray(datosCamiones) ||
      !Array.isArray(datosReservas)
    ) {
      throw new Error(
        "Los datos recibidos del servidor no son válidos."
      );
    }

    // Actualizamos los datos de la página pública.
    camiones = datosCamiones;
    reservas = datosReservas;

    datosDisponibilidadCargados = true;

    console.log("Disponibilidad actualizada correctamente.");

    return true;

  } catch (error) {
    console.error(
      "Error al consultar la disponibilidad:",
      error
    );

    // Evitamos utilizar información incompleta.
    camiones = [];
    reservas = [];
    datosDisponibilidadCargados = false;

    return false;
  }
}


/* ============================================================
   4. CONSULTA DE DISPONIBILIDAD
   ============================================================ */

/**
 * Obtiene los camiones disponibles para una fecha.
 *
 * Reglas actuales del backend:
 * - El camión debe estar operativo.
 * - No debe tener una reserva confirmada ese día.
 * - Las reservas canceladas no bloquean disponibilidad.
 *
 * IMPORTANTE:
 * Esta consulta es informativa y no realiza reservas.
 *
 * @param {string} fecha - Fecha en formato AAAA-MM-DD.
 * @returns {Array} Camiones disponibles.
 */
function consultarDisponibilidad(fecha) {

  // Obtenemos las reservas confirmadas del día.
  const reservasDelDia = reservas.filter(
    (reserva) =>
      reserva.fecha === fecha &&
      reserva.estado === "confirmada"
  );

  // Filtramos los camiones operativos que no
  // tengan una reserva confirmada ese día.
  const camionesLibres = camiones.filter(
    (camion) =>
      camion.estado === "operativo" &&
      !reservasDelDia.some(
        (reserva) => reserva.camionId === camion.id
      )
  );

  return camionesLibres;
}


/**
 * Determina el estado visual de una fecha.
 *
 * Estados:
 * - free: dos o más camiones disponibles.
 * - tentative: un camión disponible.
 * - busy: ningún camión disponible.
 * - unknown: información no disponible.
 *
 * @param {string} fecha
 * @returns {string}
 */
function obtenerEstadoDisponibilidad(fecha) {

  // Si el backend no ha respondido, no podemos
  // asegurar la disponibilidad de ningún día.
  if (!datosDisponibilidadCargados) {
    return "unknown";
  }

  const cantidadLibres =
    consultarDisponibilidad(fecha).length;

  if (cantidadLibres >= 2) {
    return "free";
  }

  if (cantidadLibres === 1) {
    return "tentative";
  }

  return "busy";
}


/* ============================================================
   5. FECHAS Y FUNCIONES AUXILIARES
   ============================================================ */

/**
 * Añade un cero delante de los números menores que 10.
 *
 * Ejemplo:
 * pad(5) devuelve "05".
 *
 * @param {number} numero
 * @returns {string}
 */
function pad(numero) {
  return numero.toString().padStart(2, "0");
}


/**
 * Convierte una fecha JavaScript al formato AAAA-MM-DD
 * utilizando la fecha local del navegador.
 *
 * Evita utilizar toISOString(), que trabaja con UTC
 * y podría marcar otro día según la zona horaria.
 *
 * @param {Date} fecha
 * @returns {string}
 */
function formatearFechaLocal(fecha) {

  const year = fecha.getFullYear();
  const month = pad(fecha.getMonth() + 1);
  const day = pad(fecha.getDate());

  return `${year}-${month}-${day}`;
}


/* ============================================================
   6. MENÚ DE NAVEGACIÓN MÓVIL
   ============================================================ */

const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

/**
 * Abre o cierra el menú móvil.
 */
if (burger && navLinks) {

  burger.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  /**
   * Cierra el menú cuando el usuario
   * selecciona un enlace de navegación.
   */
  navLinks.querySelectorAll("a").forEach((enlace) => {

    enlace.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });

  });
}


/* ============================================================
   7. CALENDARIO DE DISPONIBILIDAD
   ============================================================ */

// Días de la semana, empezando por el lunes.
const dow = ["L", "M", "X", "J", "V", "S", "D"];

// Mes que se está mostrando en el calendario.
let fechaCalendario = new Date();

// Situamos la fecha en el primer día del mes.
fechaCalendario.setDate(1);

// Nombres de los meses.
const nombresMeses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];


/**
 * Dibuja el calendario correspondiente al mes actual.
 *
 * Para cada día consulta los camiones disponibles
 * y asigna un estado visual.
 *
 * El calendario no permite confirmar reservas:
 * únicamente informa de la disponibilidad estimada.
 */
function mostrarCalendario() {

  const grid = document.getElementById("calGrid");
  const title = document.getElementById("calTitle");

  // Si los elementos no existen, no intentamos dibujar.
  if (!grid || !title) {
    return;
  }

  // Limpiamos el calendario anterior.
  grid.innerHTML = "";

  const year = fechaCalendario.getFullYear();
  const month = fechaCalendario.getMonth();

  // Mostramos el mes y el año.
  title.textContent =
    `${nombresMeses[month]} ${year}`;

  // Dibujamos los nombres de los días de la semana.
  dow.forEach((dia) => {

    const elemento = document.createElement("div");

    elemento.className = "cal-dow";
    elemento.textContent = dia;

    grid.appendChild(elemento);
  });

  // Calculamos el día de la semana en el que
  // comienza el mes.
  const primerDia = new Date(year, month, 1);

  let desplazamiento = primerDia.getDay() - 1;

  // En JavaScript, el domingo es 0.
  // Lo ajustamos para que la semana empiece en lunes.
  if (desplazamiento < 0) {
    desplazamiento = 6;
  }

  // Obtenemos el número de días del mes.
  const diasDelMes =
    new Date(year, month + 1, 0).getDate();

  // Fecha actual según la hora local del navegador.
  const fechaHoy = formatearFechaLocal(new Date());

  // Añadimos celdas vacías antes del primer día.
  for (let i = 0; i < desplazamiento; i++) {

    const elemento = document.createElement("div");

    elemento.className = "cal-day empty";

    grid.appendChild(elemento);
  }

  // Dibujamos todos los días del mes.
  for (let dia = 1; dia <= diasDelMes; dia++) {

    const fecha =
      `${year}-${pad(month + 1)}-${pad(dia)}`;

    const elemento = document.createElement("div");

    // Consultamos la disponibilidad del día.
    const estado = obtenerEstadoDisponibilidad(fecha);

    // Para el estado desconocido utilizamos una
    // celda neutra, sin clases de disponibilidad.
    let clases = "cal-day";

    if (estado !== "unknown") {
      clases += ` ${estado}`;
    }

    // Marcamos el día actual.
    if (fecha === fechaHoy) {
      clases += " today";
    }

    elemento.className = clases;
    elemento.textContent = dia;

    // Texto informativo al pasar el ratón.
    if (estado === "free") {

      elemento.title = "Disponibilidad estimada";

    } else if (estado === "tentative") {

      elemento.title = "Consultar disponibilidad";

    } else if (estado === "busy") {

      elemento.title = "Sin camiones disponibles";

    } else {

      elemento.title =
        "Disponibilidad no disponible. Contacta con la empresa.";
    }

    grid.appendChild(elemento);
  }
}


/**
 * Configura los botones para cambiar de mes.
 */
function configurarNavegacionCalendario() {

  const botonAnterior =
    document.getElementById("calPrev");

  const botonSiguiente =
    document.getElementById("calNext");

  if (botonAnterior) {

    botonAnterior.addEventListener("click", () => {

      fechaCalendario.setMonth(
        fechaCalendario.getMonth() - 1
      );

      mostrarCalendario();
    });
  }

  if (botonSiguiente) {

    botonSiguiente.addEventListener("click", () => {

      fechaCalendario.setMonth(
        fechaCalendario.getMonth() + 1
      );

      mostrarCalendario();
    });
  }
}


/* ============================================================
   8. INFORMACIÓN DE CONTACTO
   ============================================================ */

/**
 * Inserta los datos de contacto en los elementos HTML.
 */
function mostrarDatosContacto() {

  const zona = document.getElementById("cfgZona");
  const telefono = document.getElementById("cfgTelTxt");
  const email = document.getElementById("cfgEmailTxt");
  const year = document.getElementById("year");

  if (zona) {
    zona.textContent = CONFIGURACION.zona;
  }

  if (telefono) {
    telefono.textContent = CONFIGURACION.telefono;
  }

  if (email) {
    email.textContent = CONFIGURACION.email;
  }

  if (year) {
    year.textContent = new Date().getFullYear();
  }
}


/* ============================================================
   9. FORMULARIOS DE CONTACTO Y RESERVA
   ============================================================ */

/**
 * Configura el envío de un formulario mediante Formspree.
 *
 * El formulario de reserva envía una SOLICITUD.
 * No crea una reserva confirmada en Spring Boot.
 *
 * @param {HTMLFormElement} formEl
 * @param {string} mensajeExito
 */
function configurarFormulario(formEl, mensajeExito) {

  // Evitamos errores si el formulario no existe.
  if (!formEl) {
    return;
  }

  formEl.addEventListener("submit", async (evento) => {

    // Evitamos la recarga automática de la página.
    evento.preventDefault();

    const boton =
      formEl.querySelector('button[type="submit"]');

    if (!boton) {
      return;
    }

    const textoOriginal = boton.textContent;

    // Comprobamos que exista una dirección de envío
    // y que no siga utilizando el identificador de ejemplo.
    const direccionFormulario = formEl.action;

    if (
      !direccionFormulario ||
      direccionFormulario.includes("TU_ID_DE_FORMSPREE") ||
      !direccionFormulario.startsWith(
        "https://formspree.io/f/"
      )
    ) {

      mostrarNotificacion(
        "El formulario todavía no está configurado. Contacta con la empresa por teléfono.",
        true
      );

      return;
    }

    // Bloqueamos temporalmente el botón para evitar
    // que el usuario envíe varias veces el formulario.
    boton.textContent = "Enviando...";
    boton.disabled = true;

    try {

      // Enviamos los datos a Formspree.
      const respuesta = await fetch(direccionFormulario, {

        method: "POST",

        body: new FormData(formEl),

        headers: {
          Accept: "application/json"
        }

      });

      if (respuesta.ok) {

        // Informamos del envío correcto.
        mostrarNotificacion(mensajeExito, false);

        // Limpiamos el formulario.
        formEl.reset();

      } else {

        mostrarNotificacion(
          "No se ha podido enviar. Prueba de nuevo o llama por teléfono.",
          true
        );
      }

    } catch (error) {

      console.error(
        "Error al enviar el formulario:",
        error
      );

      mostrarNotificacion(
        "Error de conexión. Prueba de nuevo en unos minutos.",
        true
      );

    } finally {

      // Restauramos el botón tanto si el envío
      // ha funcionado como si ha fallado.
      boton.textContent = textoOriginal;
      boton.disabled = false;
    }
  });
}


/* ============================================================
   10. NOTIFICACIONES
   ============================================================ */

let temporizadorNotificacion = null;

/**
 * Muestra un mensaje temporal en pantalla.
 *
 * @param {string} mensaje
 * @param {boolean} esError
 */
function mostrarNotificacion(mensaje, esError) {

  const toast = document.getElementById("toast");

  if (!toast) {
    console.warn(mensaje);
    return;
  }

  // Si ya había una notificación activa,
  // cancelamos su temporizador anterior.
  if (temporizadorNotificacion !== null) {
    clearTimeout(temporizadorNotificacion);
  }

  toast.textContent = mensaje;

  toast.className =
    "toast show" + (esError ? " error" : "");

  // Ocultamos la notificación después de 5 segundos.
  temporizadorNotificacion = setTimeout(() => {

    toast.classList.remove("show");

    temporizadorNotificacion = null;

  }, 5000);
}


/* ============================================================
   11. INICIALIZACIÓN DE LA PÁGINA
   ============================================================ */

/**
 * Prepara las funcionalidades principales
 * cuando se carga la página pública.
 *
 * Orden de ejecución:
 * 1. Mostrar datos de contacto.
 * 2. Configurar navegación del calendario.
 * 3. Configurar formularios.
 * 4. Mostrar calendario inicialmente neutro.
 * 5. Consultar disponibilidad en Spring Boot.
 * 6. Actualizar el calendario con datos reales.
 */
async function iniciarPagina() {

  // Información general.
  mostrarDatosContacto();

  // Navegación entre meses.
  configurarNavegacionCalendario();

  // Formulario de solicitud de reserva.
  configurarFormulario(
    document.getElementById("bookingForm"),
    "¡Solicitud enviada! Te contactaremos para confirmar la fecha."
  );

  // Formulario de contacto.
  configurarFormulario(
    document.getElementById("contactForm"),
    "¡Mensaje enviado! Te responderemos lo antes posible."
  );

  // Dibujamos inicialmente un calendario neutro.
  mostrarCalendario();

  // Consultamos la información del backend.
  const datosCargados =
    await obtenerDatosDisponibilidad();

  // Actualizamos el calendario con el resultado.
  mostrarCalendario();

  // Si el backend no responde, avisamos al visitante.
  if (!datosCargados) {

    mostrarNotificacion(
      "No podemos consultar la disponibilidad ahora mismo. Puedes enviar una solicitud o contactar con la empresa.",
      true
    );
  }
}


// Iniciamos la página pública.
iniciarPagina();
