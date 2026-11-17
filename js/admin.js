// Obtenemos el formulario HTML utilizado para crear nuevas reservas.
const formulario = document.getElementById("formReserva");

// Almacena temporalmente los camiones recibidos desde el backend.
// Los datos originales están guardados en la base de datos H2.
let camiones = [];

// Obtenemos el formulario HTML para modificar el conductor de un camión.
const formularioConductor = document.getElementById("formConductor");

/**
 * Gestiona el formulario para cambiar el conductor de un camión.
 * Envía el cambio al backend y actualiza la interfaz.
 */
formularioConductor.addEventListener("submit", async function (evento) {
  // Evita que el formulario recargue la página.
  evento.preventDefault();

  // Obtenemos el ID del camión y el nombre del nuevo conductor.
  const camionId = Number(document.getElementById("camionConductor").value);
  const nombreConductor = document
    .getElementById("nombreConductor")
    .value.trim();

  // Localizamos el camión dentro del array cargado desde el backend.
  const camionSeleccionado = camiones.find((camion) => camion.id === camionId);

  // Comprobamos que el camión exista antes de consultar su estado.
  if (!camionSeleccionado) {
    alert(
      "No se ha encontrado el camión. Comprueba que los datos estén cargados.",
    );
    return;
  }

  try {
    // Enviamos el nuevo conductor al backend mediante una petición PATCH.
    const respuesta = await actualizarConductorBackend(
      camionId,
      nombreConductor,
    );

    // Comprobamos si el servidor ha aceptado la modificación.
    if (!respuesta.ok) {
      alert("No se ha podido actualizar el conductor.");
      return;
    }

    // Convertimos la respuesta JSON en un objeto JavaScript.
    const camionActualizado = await respuesta.json();

    // Actualizamos los datos locales con el valor guardado en el backend.
    camionSeleccionado.conductor = camionActualizado.conductor;

    // Refrescamos las secciones que muestran información del conductor.
    mostrarConductores();
    mostrarReservas();

    // Limpiamos el formulario.
    formularioConductor.reset();

    console.table(camiones);
  } catch (error) {
    // Gestionamos posibles errores de conexión o de la petición.
    console.error("Error al actualizar el conductor:", error);
    alert("No se ha podido conectar con el servidor.");
  }
});

/**
 * Gestiona el formulario para modificar el estado de un camión.
 * Advierte al administrador si existen reservas futuras confirmadas.
 */
const formularioEstado = document.getElementById("formEstadoCamion");

formularioEstado.addEventListener("submit", async function (evento) {
  // Evitamos que el formulario recargue la página.
  evento.preventDefault();

  // Obtenemos el camión seleccionado y el nuevo estado.
  const camionId = Number(document.getElementById("camionEstado").value);
  const nuevoEstado = document.getElementById("nuevoEstado").value;

  // Buscamos el camión dentro de los datos cargados.
  const camionSeleccionado = camiones.find((camion) => camion.id === camionId);

  // Comprobamos que el camión seleccionado exista.
  if (!camionSeleccionado) {
    alert("No se ha encontrado el camión seleccionado.");
    return;
  }

  // Si el camión deja de estar operativo, comprobamos sus reservas.
  if (nuevoEstado !== "operativo") {
    const hoy = new Date().toLocaleDateString("en-CA");

    // Buscamos reservas confirmadas desde hoy en adelante.
    const reservasPendientes = reservas.filter(
      (reserva) =>
        reserva.camionId === camionId &&
        reserva.estado === "confirmada" &&
        reserva.fecha >= hoy,
    );

    // Pedimos confirmación si existen reservas pendientes.
    if (reservasPendientes.length > 0) {
      const confirmar = confirm(
        `ATENCIÓN: Este camión tiene ${reservasPendientes.length} reservas pendientes.\n\n¿Quieres cambiar su estado igualmente?`,
      );

      if (!confirmar) {
        return;
      }
    }
  }

  try {
    // Enviamos el cambio al backend mediante PATCH.
    const respuesta = await actualizarEstadoBackend(camionId, nuevoEstado);

    if (!respuesta.ok) {
      alert("No se ha podido actualizar el estado del camión.");
      return;
    }

    // Obtenemos el camión actualizado desde Spring Boot.
    const camionActualizado = await respuesta.json();

    // Actualizamos el estado en nuestro array local.
    camionSeleccionado.estado = camionActualizado.estado;

    // Refrescamos la información visible.
    mostrarConductores();
    console.table(camiones);

    // Limpiamos el formulario.
    formularioEstado.reset();
  } catch (error) {
    console.error("Error al actualizar el camión:", error);
    alert("No se ha podido conectar con el servidor.");
  }
});

/**
 * Muestra los camiones, sus conductores y sus estados
 * en el panel de administración.
 *
 * Los datos proceden del array camiones,
 * previamente cargado desde el backend.
 */
function mostrarConductores() {
  // Localizamos el contenedor HTML donde mostraremos los camiones.
  const lista = document.getElementById("listaConductores");

  // Eliminamos el contenido anterior para evitar duplicados.
  lista.innerHTML = "";

  // Recorremos todos los camiones disponibles.
  camiones.forEach((camion) => {
    // Creamos un elemento HTML para cada camión.
    const elemento = document.createElement("p");

    // Generamos el contenido HTML con los datos del camión.
    elemento.innerHTML = `
    <h3>${camion.nombre}</h3>
    <p>Conductor: ${camion.conductor}</p>
    <span class="estado ${camion.estado}">
        ${camion.estado.replace("_", " ")}
    </span>
`;

    // Incorporamos el elemento al contenedor de la página.
    lista.appendChild(elemento);
  });
}

let reservas = [];

/**
 * Gestiona la creación de una nueva reserva.
 *
 * Comprueba que el camión esté operativo, valida las horas
 * y evita reservar dos veces el mismo camión en un día.
 *
 * Si todo es correcto, envía la reserva al backend.
 */
formulario.addEventListener("submit", async function (evento) {
  // Evitamos que el formulario recargue la página.
  evento.preventDefault();

  // Obtenemos el ID del camión seleccionado.
  const camionId = Number(document.getElementById("camion").value);

  // Buscamos el camión en nuestro array.
  const camionSeleccionado = camiones.find((camion) => camion.id === camionId);

  // Comprobamos que el camión seleccionado exista.
  if (!camionSeleccionado) {
    alert("No se ha encontrado el camión seleccionado.");
    return;
  }

  // Solo permitimos reservar camiones operativos.
  if (camionSeleccionado.estado !== "operativo") {
    alert("No puedes reservar este camión porque no está operativo.");
    return;
  }

  // Recogemos la fecha y las horas introducidas.
  const fecha = document.getElementById("fecha").value;
  const horaInicio = document.getElementById("horaInicio").value;
  const horaFin = document.getElementById("horaFin").value;

  // La hora de finalización debe ser posterior a la inicial.
  if (horaFin <= horaInicio) {
    alert("Error: la hora de finalización debe ser posterior a la de inicio");
    return;
  }

  // Construimos el objeto que enviaremos a Spring Boot.
  // No enviamos el ID porque la base de datos lo genera automáticamente.
  const nuevaReserva = {
    camionId: camionId,
    fecha: fecha,
    horaInicio: horaInicio,
    horaFin: horaFin,
    estado: "confirmada",
  };

  // Comprobamos si ya existe una reserva confirmada
  // para este camión en la misma fecha.
  const hayConflicto = reservas.some(
    (reserva) =>
      reserva.camionId === nuevaReserva.camionId &&
      reserva.fecha === nuevaReserva.fecha &&
      reserva.estado === "confirmada",
  );

  if (hayConflicto) {
    alert("Este camión ya tiene una reserva confirmada para ese día");
    return;
  }

  // Intentamos guardar la reserva en el backend.
  try {
    // Enviamos la reserva a Spring Boot para guardarla en H2.
    const respuesta = await guardarReservaBackend(nuevaReserva);

    if (!respuesta.ok) {
      // Mostramos un mensaje según el código HTTP recibido.
      if (respuesta.status === 400) {
        alert("El horario de la reserva no es válido.");
      } else if (respuesta.status === 404) {
        alert("El camión seleccionado no existe.");
      } else if (respuesta.status === 409) {
        alert("El camión no está disponible o ya tiene una reserva ese día.");
      } else {
        alert("Ha ocurrido un error al guardar la reserva.");
      }

      return;
    }

    // Actualizamos las reservas consultando directamente Spring Boot.
    await obtenerReservasBackend();
  } catch (error) {
    // Se ejecuta si no podemos conectar con Spring Boot.
    console.error("Error al conectar con el backend:", error);

    alert(
      "No se puede conectar con el servidor. Comprueba que Spring Boot está funcionando.",
    );
  }
});

/**
 * Muestra las reservas confirmadas en la tabla del administrador.
 *
 * Ordena las reservas por fecha y añade un botón para cancelarlas.
 * Las cancelaciones se guardan en el backend mediante PATCH.
 */
function mostrarReservas() {
  // Localizamos la tabla donde mostraremos las reservas.
  const lista = document.getElementById("listaReservas");

  // Limpiamos las filas anteriores para evitar duplicados.
  lista.innerHTML = "";

  // Filtramos las reservas confirmadas y las ordenamos por fecha.
  reservas
    .filter((reserva) => reserva.estado === "confirmada")
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .forEach((reserva) => {
      // Creamos una fila HTML para cada reserva.
      const elemento = document.createElement("tr");

      // Buscamos el camión para obtener el nombre del conductor.
      const camion = camiones.find((c) => c.id === reserva.camionId);
      const conductor = camion ? camion.conductor : "Sin asignar";

      // Introducimos los datos de la reserva en la fila.
      elemento.innerHTML = `
        <td>Camión ${reserva.camionId}</td>
        <td>${conductor}</td>
        <td>${reserva.fecha}</td>
        <td>${reserva.horaInicio}</td>
        <td>${reserva.horaFin}</td>
        <td>${reserva.estado}</td>
      `;

      // Creamos el botón para cancelar la reserva.
      const botonCancelar = document.createElement("button");
      botonCancelar.textContent = "Cancelar";

      // Ejecutamos esta función cuando se pulsa el botón.
      botonCancelar.addEventListener("click", async function () {
        try {
          // Solicitamos al backend la cancelación de la reserva.
          const respuesta = await cancelarReservaBackend(reserva.id);

          // Comprobamos si Spring Boot ha rechazado la operación.
          if (!respuesta.ok) {
            alert("No se ha podido cancelar la reserva.");
            return;
          }

          // Consultamos de nuevo Spring Boot para obtener
          // las reservas actualizadas directamente desde H2.
          await obtenerReservasBackend();
        } catch (error) {
          // Capturamos los errores de conexión con el backend.
          console.error("Error al cancelar la reserva:", error);

          alert("No se puede conectar con el servidor. Inténtalo de nuevo.");
        }
      });

      // Creamos una celda específica para el botón.
      const celdaAcciones = document.createElement("td");

      // Añadimos el botón a la celda.
      celdaAcciones.appendChild(botonCancelar);

      // Añadimos la celda a la fila.
      elemento.appendChild(celdaAcciones);

      // Incorporamos la fila a la tabla.
      lista.appendChild(elemento);
    });
}

/**
 * Muestra las reservas canceladas en el panel de administración.
 *
 * Filtra las reservas con estado "cancelada",
 * las ordena por fecha y genera una fila HTML para cada una.
 */
function mostrarCanceladas() {
  // Localizamos la tabla de reservas canceladas.
  const lista = document.getElementById("listaCanceladas");

  // Eliminamos las filas anteriores para evitar duplicados.
  lista.innerHTML = "";

  // Seleccionamos únicamente las reservas canceladas.
  reservas
    .filter((reserva) => reserva.estado === "cancelada")

    // Ordenamos las reservas por fecha, de más antigua a más reciente.
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

    // Recorremos las reservas y creamos una fila para cada una.
    .forEach((reserva) => {
      const fila = document.createElement("tr");

      // Introducimos los datos de la reserva en las celdas.
      fila.innerHTML = `
        <td>Camión ${reserva.camionId}</td>
        <td>${reserva.fecha}</td>
        <td>${reserva.horaInicio}</td>
        <td>${reserva.horaFin}</td>
        <td>${reserva.estado}</td>
      `;

      // Añadimos la fila a la tabla.
      lista.appendChild(fila);
    });
}

mostrarReservas();
mostrarCanceladas();
mostrarConductores();

/**
 * Obtiene todas las reservas almacenadas en el backend.
 *
 * Realiza una petición GET a Spring Boot, convierte la
 * respuesta JSON en objetos JavaScript y actualiza las tablas.
 */
async function obtenerReservasBackend() {
  try {
    // Solicitamos al backend todas las reservas guardadas en H2.
    const respuesta = await fetch("http://localhost:8080/reservas");

    // Comprobamos que el servidor haya respondido correctamente.
    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener las reservas");
    }

    // Convertimos la respuesta JSON en un array de objetos JavaScript.
    const reservasBackend = await respuesta.json();

    // Actualizamos nuestro array local con los datos recibidos.
    reservas = reservasBackend;

    // Mostramos las reservas confirmadas y canceladas.
    mostrarReservas();
    mostrarCanceladas();

    console.log("Reservas cargadas desde Java:", reservas);
  } catch (error) {
    // Capturamos errores de conexión o de procesamiento.
    console.error("Error al conectar con Spring Boot:", error);
  }
}

// Cargamos primero los camiones y después las reservas.
async function cargarDatosIniciales() {
  await obtenerCamionesBackend();
  await obtenerReservasBackend();
}

cargarDatosIniciales();

/**
 * Obtiene los camiones almacenados en el backend.
 *
 * Realiza una petición GET a Spring Boot,
 * actualiza el array local y muestra los conductores.
 */

async function obtenerCamionesBackend() {
  try {
    // Solicitamos al backend la lista de camiones.
    const respuesta = await fetch("http://localhost:8080/camiones");

    // Comprobamos si el servidor ha respondido correctamente.
    if (!respuesta.ok) {
      alert("Error del servidor al cargar los camiones.");
      return;
    }

    // Convertimos la respuesta JSON en objetos JavaScript.
    const camionesBackend = await respuesta.json();

    // Guardamos los camiones recibidos en nuestro array local.
    camiones = camionesBackend;

    // Actualizamos la información visible en el panel.
    mostrarConductores();

    console.log("Camiones recibidos de H2:", camionesBackend);
  } catch (error) {
    // Capturamos los errores de conexión con Spring Boot.
    console.error("Error al cargar los camiones:", error);

    alert(
      "No se puede conectar con el servidor. Comprueba que Spring Boot está funcionando.",
    );
  }
}

/**
 * Actualiza el estado de un camión en el backend.
 *
 * @param {number} id - Identificador del camión.
 * @param {string} nuevoEstado - Nuevo estado del camión.
 * @returns {Promise<Response>} Respuesta HTTP del servidor.
 */
async function actualizarEstadoBackend(id, nuevoEstado) {
  // Enviamos una petición PATCH al controlador de camiones.
  const respuesta = await fetch(`http://localhost:8080/camiones/${id}/estado`, {
    method: "PATCH",
    headers: {
      "Content-Type": "text/plain",
    },
    body: nuevoEstado,
  });

  // Devolvemos la respuesta para que el formulario
  // compruebe si la actualización se realizó correctamente.
  return respuesta;
}

/**
 * Actualiza el conductor asignado a un camión en el backend.
 *
 * @param {number} id - Identificador del camión.
 * @param {string} nuevoConductor - Nombre del nuevo conductor.
 * @returns {Promise<Response>} Respuesta HTTP del servidor.
 */
async function actualizarConductorBackend(id, nuevoConductor) {
  // Enviamos una petición PATCH al controlador de camiones.
  const respuesta = await fetch(
    `http://localhost:8080/camiones/${id}/conductor`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "text/plain",
      },
      body: nuevoConductor,
    },
  );

  // Devolvemos la respuesta HTTP para que el formulario
  // compruebe si el backend ha aceptado la modificación.
  return respuesta;
}

/**
 * Envía una nueva reserva al backend para almacenarla.
 *
 * @param {Object} reserva - Objeto con los datos de la reserva.
 * @returns {Promise<Response>} Respuesta HTTP del servidor.
 */
async function guardarReservaBackend(reserva) {
  // Enviamos una petición POST para crear una nueva reserva.
  const respuesta = await fetch("http://localhost:8080/reservas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    // Convertimos el objeto JavaScript en texto JSON.
    body: JSON.stringify(reserva),
  });

  // Devolvemos la respuesta para comprobar si se guardó correctamente.
  return respuesta;
}

/**
 * Solicita al backend la cancelación de una reserva.
 *
 * @param {number} id - Identificador de la reserva.
 * @returns {Promise<Response>} Respuesta HTTP del servidor.
 */
async function cancelarReservaBackend(id) {
  // Enviamos una petición PATCH para cancelar la reserva indicada.
  const respuesta = await fetch(
    `http://localhost:8080/reservas/${id}/cancelar`,
    {
      method: "PATCH",
    },
  );

  // Devolvemos la respuesta para comprobar si la cancelación
  // se ha realizado correctamente.
  return respuesta;
}
