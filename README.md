# BHC - Bombeos de Hormigón Casas

**Aplicación web full stack para la consulta de disponibilidad y gestión de reservas de una empresa de bombeo de hormigón.**

Proyecto desarrollado con fines educativos durante mi formación en Desarrollo de Aplicaciones Web (DAW), utilizando Java, Spring Boot, JavaScript y una base de datos H2.

## 1. Descripción del proyecto

BHC nace de la idea de digitalizar parte de la actividad de una empresa de bombeo de hormigón, facilitando la consulta de disponibilidad de camiones y la organización de los servicios.

La aplicación está dividida en dos interfaces:

- **Web pública:** presenta los servicios de la empresa, su flota, tarifas orientativas, calendario de disponibilidad y formularios de contacto y solicitud de reserva.
- **Panel de administración:** permite gestionar los camiones, conductores y reservas desde una interfaz conectada al backend.

El proyecto busca aplicar conocimientos de desarrollo web a una necesidad empresarial real.

## 2. Objetivos

- Digitalizar la consulta de disponibilidad de los camiones.
- Facilitar la solicitud de servicios de bombeo.
- Centralizar la gestión de reservas.
- Evitar asignaciones duplicadas de un mismo camión en una fecha.
- Gestionar los conductores y el estado operativo de los vehículos.
- Aplicar una arquitectura frontend, backend y base de datos.
- Practicar el desarrollo y consumo de una API REST.

## 3. Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API para la comunicación HTTP con el backend

### Backend

- Java
- Spring Boot
- Spring Data JPA
- API REST
- Maven

### Base de datos

- H2 Database
- Hibernate / JPA

### Herramientas de desarrollo

- IntelliJ IDEA
- Visual Studio Code
- Git
- GitHub

## 4. Funcionalidades implementadas

### Web pública

- Presentación de los servicios de bombeo de hormigón.
- Información sobre la flota y sus características.
- Visualización de tarifas orientativas.
- Calendario mensual de disponibilidad conectado al backend.
- Consulta de disponibilidad según los camiones operativos y las reservas confirmadas.
- Indicadores visuales de disponibilidad:
  - Verde: dos o más camiones disponibles.
  - Amarillo: un camión disponible.
  - Rojo: ningún camión disponible.
- Navegación entre meses.
- Formulario de solicitud de reserva.
- Formulario de contacto.
- Diseño adaptable a diferentes tamaños de pantalla.

**Importante:** los formularios están preparados para utilizar Formspree, pero requieren configurar un identificador real antes de poder enviar mensajes.

Actualmente, las solicitudes del formulario no se almacenan automáticamente en la base de datos ni aparecen como pendientes en el panel de administración.

### Panel de administración

- Consulta de los camiones registrados.
- Visualización de los conductores asignados.
- Modificación del conductor de un camión.
- Gestión del estado operativo de los vehículos.
- Creación de reservas confirmadas.
- Validación de fechas y horarios.
- Prevención de reservas duplicadas para un mismo camión y día.
- Cancelación de reservas.
- Consulta de reservas confirmadas y canceladas.
- Actualización de la información desde el backend.

### Backend

- API REST para gestionar camiones y reservas.
- Validaciones de reglas de negocio.
- Persistencia de información mediante Spring Data JPA.
- Almacenamiento local en una base de datos H2.
- Separación entre entidades, repositorios y controladores.

## 5. Arquitectura del proyecto

La aplicación sigue una arquitectura de tres capas principales:

**Frontend (HTML, CSS y JavaScript)**

Se encarga de mostrar la información, gestionar la interacción con el usuario y realizar peticiones HTTP.

↓

**Backend (Java y Spring Boot)**

Recibe las peticiones, aplica las reglas de negocio y gestiona las operaciones sobre los datos.

↓

**Base de datos (H2)**

Almacena la información de camiones y reservas.

La comunicación entre el frontend y el backend se realiza mediante una API REST que intercambia información en formato JSON.

### Ejemplos de endpoints

| Método | Endpoint | Función |
|---|---|---|
| GET | `/camiones` | Consultar camiones |
| PATCH | `/camiones/{id}/estado` | Modificar estado operativo |
| PATCH | `/camiones/{id}/conductor` | Modificar conductor |
| GET | `/reservas` | Consultar reservas |
| POST | `/reservas` | Crear reserva confirmada |
| PATCH | `/reservas/{id}/cancelar` | Cancelar reserva |

## 6. Estructura del proyecto

BHC/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw.cmd
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── main.js
│   └── admin.js
├── index.html
├── admin.html
├── .gitignore
└── README.md
```

- `index.html`: web pública.
- `admin.html`: panel de administración.
- `main.js`: lógica de la web pública y del calendario.
- `admin.js`: lógica de gestión administrativa.
- `backend/`: aplicación Java con Spring Boot.
- `README.md`: documentación del proyecto.

## 7. Ejecución en entorno local

### Requisitos

- JDK compatible con la versión de Java configurada en el proyecto.
- Maven Wrapper incluido en el backend.
- Un navegador web.
- Un servidor HTTP local para el frontend.

### Paso 1. Ejecutar el backend

Desde la carpeta `backend`, en Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

También puede iniciarse desde IntelliJ IDEA.

Por defecto, el backend utiliza:

```text
http://localhost:8080
```

### Paso 2. Ejecutar el frontend

Desde la carpeta raíz del proyecto, utilizando el servidor web incluido en un JDK compatible:

```powershell
jwebserver -p 5501
```

La web pública estará disponible en:

```text
http://localhost:5501/index.html
```

Y el panel de administración en:

```text
http://localhost:5501/admin.html
```

**Nota:** la configuración actual está preparada para trabajar en local, utilizando los puertos 5501 y 8080.

## 8. Reglas de negocio

La aplicación incorpora algunas validaciones para mantener la coherencia de las reservas:

- Una reserva debe estar asociada a un camión existente.
- No se puede reservar un camión que no esté operativo.
- La hora de inicio debe ser anterior a la hora de finalización.
- No se permite crear dos reservas confirmadas para el mismo camión y fecha.
- Una reserva cancelada permanece registrada en la base de datos.
- El calendario público calcula la disponibilidad a partir de los camiones operativos y las reservas confirmadas.

## 9. Estado actual del proyecto

**Versión 1.0 - Prototipo funcional de aprendizaje.**

Se han desarrollado y probado las principales operaciones de gestión de camiones y reservas, así como la conexión entre el calendario público y el backend.

La aplicación funciona en un entorno local y no está preparada todavía para su utilización comercial en producción.

### Limitaciones actuales

- El panel administrativo no dispone de autenticación.
- Los endpoints administrativos no están protegidos mediante autorización.
- Los formularios públicos necesitan configurar Formspree.
- No existe un flujo integrado de solicitudes pendientes, aceptación y rechazo.
- La base de datos H2 está configurada para desarrollo local.
- El calendario actualiza sus datos al cargar o recargar la página.
- Los datos comerciales son provisionales y deben ser confirmados por el propietario.
- No se ha realizado un despliegue público del sistema.

## 10. Posibles mejoras futuras

- Implementar autenticación y autorización para el administrador.
- Integrar las solicitudes públicas directamente con el backend.
- Incorporar estados de reserva: pendiente, confirmada y rechazada.
- Añadir gestión de clientes y obras.
- Permitir asignar diferentes camiones y conductores a cada servicio.
- Mejorar la planificación mediante horarios y franjas de disponibilidad.
- Incorporar pruebas automatizadas.
- Añadir validaciones adicionales y medidas de seguridad.
- Preparar una base de datos adecuada para producción.
- Desplegar la aplicación en un entorno seguro.
- Completar los requisitos legales y de protección de datos antes de su utilización comercial.

## 11. Aprendizajes

Durante el desarrollo de BHC he trabajado conceptos como:

- Organización de un proyecto full stack.
- Diseño de entidades y relaciones.
- Desarrollo de APIs REST con Spring Boot.
- Persistencia de datos con JPA e Hibernate.
- Comunicación entre frontend y backend.
- Operaciones HTTP y tratamiento de respuestas.
- Validación de reglas de negocio.
- Gestión de errores.
- Uso de Git y GitHub para el control de versiones.
- Documentación técnica de un proyecto.

Este proyecto forma parte de mi proceso de aprendizaje y tiene como objetivo acercar los conocimientos adquiridos a situaciones empresariales reales.

## 12. Autor

**Gaston1990**

Estudiante de Desarrollo de Aplicaciones Web (DAW).

Proyecto personal de aprendizaje y práctica de desarrollo full stack.