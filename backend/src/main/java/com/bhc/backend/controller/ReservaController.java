
package com.bhc.backend.controller;

import com.bhc.backend.model.Reserva;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.bhc.backend.repository.ReservaRepository;
import com.bhc.backend.repository.CamionRepository;
import java.util.List;

/**
 * Controlador REST encargado de gestionar las reservas de BHC.
 *
 * Permite consultar, crear y cancelar reservas de camiones
 * de bombeo de hormigón.
 *
 * Las reservas se almacenan de forma persistente mediante
 * ReservaRepository, utilizando Spring Data JPA.
 */
@RestController
@CrossOrigin(origins = "http://localhost:5501")

public class ReservaController {

    // Repositorio para consultar y guardar las reservas.
    private final ReservaRepository reservaRepository;

    // Repositorio para consultar los camiones y su estado.
    private final CamionRepository camionRepository;

    /**
     * Recibe los repositorios mediante inyección de dependencias.
     *
     * Spring Boot proporciona automáticamente ambos repositorios
     * cuando crea este controlador.
     *
     * @param reservaRepository repositorio de reservas
     * @param camionRepository repositorio de camiones
     */
    public ReservaController(ReservaRepository reservaRepository,
                             CamionRepository camionRepository) {

        this.reservaRepository = reservaRepository;
        this.camionRepository = camionRepository;
    }

    /**
     * Obtiene todas las reservas almacenadas en la base de datos,
     * tanto las confirmadas como las canceladas.
     *
     * Endpoint: GET /reservas
     *
     * @return lista completa de reservas
     */
    @GetMapping("/reservas")
    public List<Reserva> obtenerReservas() {
        return reservaRepository.findAll();
    }

    /**
     * Crea una nueva reserva para un camión.
     *
     * Endpoint: POST /reservas
     *
     * Reglas de negocio:
     * - Toda reserva nueva comienza con estado "confirmada".
     * - La hora de inicio debe ser anterior a la hora de fin.
     * - Un camión solo puede tener una reserva confirmada por día.
     * - Las reservas canceladas no bloquean nuevas reservas.
     *
     * Respuestas de error:
     * - HTTP 400: horario incorrecto.
     * - HTTP 409: camión ya reservado para ese día.
     *
     * @param reserva datos de la reserva recibidos en formato JSON
     * @return reserva guardada con su identificador generado
     */
    @PostMapping("/reservas")
    public Reserva crearReserva(@RequestBody Reserva reserva) {
        // El backend establece el estado inicial, sin confiar
        // en el estado que pueda enviar el navegador.
        reserva.setEstado("confirmada");


        // Busca el camión solicitado en la base de datos.
        // Si no existe, devuelve HTTP 404.
        var camion = camionRepository.findById(reserva.getCamionId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El camión solicitado no existe"
                ));

        // Solo permite reservar camiones operativos.
        if (!"operativo".equals(camion.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede reservar un camión que no está operativo"
            );
        }


        // Comprueba que el horario tenga un orden válido.
        if (!reserva.getHoraInicio().isBefore(reserva.getHoraFin())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La hora de inicio debe ser anterior a la hora de fin"
            );
        }

        // Regla de negocio BHC:
        // Un camión no puede tener dos reservas confirmadas
        // en la misma fecha, aunque sus horarios sean distintos.
        for (Reserva existente : reservaRepository.findAll()) {

            if (existente.getCamionId() == reserva.getCamionId()
                    && existente.getFecha().equals(reserva.getFecha())
                    && "confirmada".equals(existente.getEstado())) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El camión ya tiene una reserva confirmada para ese día"
                );
            }
        }
        // Guarda la reserva en H2 mediante JPA.
        // La base de datos genera automáticamente su ID.
        return reservaRepository.save(reserva);
    }


    /**
     * Cancela una reserva existente sin eliminarla de la base de datos.
     *
     * Endpoint: PATCH /reservas/{id}/cancelar
     *
     * La cancelación modifica el estado a "cancelada",
     * permitiendo conservar el historial de servicios.
     *
     * Respuestas de error:
     * - HTTP 404: reserva no encontrada.
     *
     * @param id identificador de la reserva que se desea cancelar
     * @return reserva actualizada con estado "cancelada"
     */
    @PatchMapping("/reservas/{id}/cancelar")
    public Reserva cancelarReserva(@PathVariable int id) {

        // Busca la reserva o devuelve HTTP 404 si no existe.
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reserva no encontrada"
                ));

        // Cancelación lógica: conserva el registro en la base de datos.
        reserva.setEstado("cancelada");

        return reservaRepository.save(reserva);
    }

}
