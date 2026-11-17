/* ============================================================
   CONFIG — edita aquí los datos de tu empresa
   ============================================================ */

const CONFIGURACION = {
  nombre: "Bombeos de Hormigon Casas",
  telefono: "983 00 00 00",
  email: "info@pluma47.es",
  zona: "Valladolid capital y provincia",

  // Calendario de disponibilidad.
  // Formato de fecha: "AAAA-MM-DD"
  // Estados posibles: "free" (disponible), "tentative" (consultar), "busy" (ocupado)
  // Cualquier día del mes que NO aparezca aquí se muestra neutro (sin marcar).
  disponibilidad: {
    // Ejemplo — sustituye por tus fechas reales:
    "2026-08-03": "free",
    "2026-08-04": "free",
    "2026-08-05": "busy",
    "2026-08-06": "busy",
    "2026-08-07": "free",
    "2026-08-10": "tentative",
    "2026-08-11": "free",
    "2026-08-12": "free",
    "2026-08-13": "busy",
    "2026-08-14": "free",
    "2026-08-17": "free",
    "2026-08-18": "tentative",
    "2026-08-19": "free",
    "2026-08-20": "busy",
    "2026-08-21": "busy",
    "2026-08-24": "free",
    "2026-08-25": "free",
    "2026-08-26": "tentative",
    "2026-08-27": "free",
    "2026-08-28": "free",
  },
};

const camiones = JSON.parse(localStorage.getItem("camionesBHC")) || [
    { id: 1, nombre: "Camión 1", conductor: "Sin asignar", estado: "operativo" },
    { id: 2, nombre: "Camión 2", conductor: "Sin asignar", estado: "operativo" },
    { id: 3, nombre: "Camión 3", conductor: "Sin asignar", estado: "operativo" }
];
const reservas = JSON.parse(localStorage.getItem("reservasBHC")) || [];
console.table(camiones);
console.table(reservas);

function consultarDisponibilidad(fecha) {
  const reservasDelDia = reservas.filter(
    (reserva) => reserva.fecha === fecha && reserva.estado === "confirmada",
  );
  const camionesLibres = camiones.filter(
    (camion) =>
      camion.estado === "operativo" &&
      !reservasDelDia.some((reserva) => reserva.camionId === camion.id),
  );
  return camionesLibres;
}
const libres = consultarDisponibilidad("2026-11-03");

console.log("Camiones disponibles:", libres.length);

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- menú móvil ---------- */
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
burger.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks
  .querySelectorAll("a")
  .forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open")),
  );

/* ---------- calendario ---------- */
const dow = ["L", "M", "X", "J", "V", "S", "D"];
let fechaCalendario = new Date();
fechaCalendario.setDate(1);

function pad(n) {
  return n.toString().padStart(2, "0");
}

function mostrarCalendario() {
  const grid = document.getElementById("calGrid");
  const title = document.getElementById("calTitle");
  grid.innerHTML = "";
  const nombreMes = [
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
  title.textContent =
    nombreMes[fechaCalendario.getMonth()] + " " + fechaCalendario.getFullYear();

  dow.forEach((d) => {
    const el = document.createElement("div");
    el.className = "cal-dow";
    el.textContent = d;
    grid.appendChild(el);
  });

  const year = fechaCalendario.getFullYear();
  const month = fechaCalendario.getMonth();
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1; // lunes = 0
  if (startOffset < 0) startOffset = 6;

  const diasDelMes = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement("div");
    el.className = "cal-day empty";
    grid.appendChild(el);
  }

  for (let d = 1; d <= diasDelMes; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    const el = document.createElement("div");
    const camionesLibres = consultarDisponibilidad(dateStr);

    let status = "busy";

    if (camionesLibres.length >= 2) {
      status = "free";
    } else if (camionesLibres.length === 1) {
      status = "tentative";
    } else {
      status = "busy";
    }
    el.className =
      "cal-day" +
      (status ? " " + status : "") +
      (dateStr === todayStr ? " today" : "");
    el.textContent = d;
    el.title =
      status === "free"
        ? "Disponible"
        : status === "busy"
          ? "Ocupado"
          : status === "tentative"
            ? "Consultar disponibilidad"
            : "";
    grid.appendChild(el);
  }
}
document.getElementById("calPrev").addEventListener("click", () => {
  fechaCalendario.setMonth(fechaCalendario.getMonth() - 1);
  mostrarCalendario();
});
document.getElementById("calNext").addEventListener("click", () => {
  fechaCalendario.setMonth(fechaCalendario.getMonth() + 1);
  mostrarCalendario();
});
mostrarCalendario();

/* ---------- datos de contacto en la web ---------- */
document.getElementById("cfgZona").textContent = CONFIGURACION.zona;
document.getElementById("cfgTelTxt").textContent = CONFIGURACION.telefono;
document.getElementById("cfgEmailTxt").textContent = CONFIGURACION.email;

/* ---------- envío de formularios (Formspree) ---------- */
function configurarFormulario(formEl, successMsg) {
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    if (formEl.action.includes("TU_ID_DE_FORMSPREE")) {
      mostrarNotificacion(
        "Falta configurar Formspree: sustituye TU_ID_DE_FORMSPREE por tu ID real en el código.",
        true,
      );
      return;
    }

    btn.textContent = "Enviando...";
    btn.disabled = true;
    try {
      const res = await fetch(formEl.action, {
        method: "POST",
        body: new FormData(formEl),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        mostrarNotificacion(successMsg, false);
        formEl.reset();
      } else {
        mostrarNotificacion(
          "No se ha podido enviar. Prueba de nuevo o llama por teléfono.",
          true,
        );
      }
    } catch (err) {
      mostrarNotificacion(
        "Error de conexión. Prueba de nuevo en unos minutos.",
        true,
      );
    }
    btn.textContent = originalText;
    btn.disabled = false;
  });
}
configurarFormulario(
  document.getElementById("bookingForm"),
  "¡Solicitud de reserva enviada! Te contactamos para confirmar la fecha.",
);
configurarFormulario(
  document.getElementById("contactForm"),
  "¡Mensaje enviado! Te respondemos lo antes posible.",
);

function mostrarNotificacion(msg, isError) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast show" + (isError ? " error" : "");
  setTimeout(() => toast.classList.remove("show"), 5000);
}
