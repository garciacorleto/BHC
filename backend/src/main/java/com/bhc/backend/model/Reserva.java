
package com.bhc.backend.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.time.LocalDate;
import java.time.LocalTime;

/*
 * Representa una reserva de un camión de bombeo de hormigón.
 *
 * Cada reserva contiene el camión asignado, la fecha,
 * el horario del servicio y su estado.
 *
 * Esta clase es una entidad JPA, por lo que sus datos
 * se almacenan de forma persistente en la base de datos.
 */
@Entity
public class Reserva {
    // Identificador único generado automáticamente por la base de datos.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    // Identificador del camión al que pertenece la reserva.
    private int camionId;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    // Estado de la reserva: "confirmada" o "cancelada".
    private String estado;


    /**
     * Constructor vacío requerido por JPA
     * para crear objetos al recuperar datos de la base de datos.
     */
    public Reserva() {

    }

    /**
     * Construye una reserva con todos sus datos.
     *
     * @param id identificador de la reserva
     * @param camionId identificador del camión asignado
     * @param fecha fecha del servicio
     * @param horaInicio hora de inicio del servicio
     * @param horaFin hora de finalización del servicio
     * @param estado estado de la reserva
     */
    public Reserva(Integer id, int camionId, LocalDate fecha, LocalTime horaInicio, LocalTime horaFin, String estado) {
        this.id = id;
        this.camionId = camionId;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.estado = estado;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getCamionId() {
        return camionId;
    }

    public void setCamionId(int camionId) {
        this.camionId = camionId;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
