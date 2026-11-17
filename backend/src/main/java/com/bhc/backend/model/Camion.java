package com.bhc.backend.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/**
 * Representa un camión de bombeo de hormigón de BHC.
 *
 * Cada camión tiene un identificador, un nombre, un conductor
 * asignado y datos sobre su disponibilidad operativa.
 *
 * Esta clase es una entidad JPA, por lo que sus datos
 * se almacenan de forma persistente en la base de datos.
 */
@Entity
public class Camion {
    // Identificador único asignado por la aplicación.
    // A diferencia de Reserva, no se genera automáticamente.
    @Id
    private int id;
    private String nombre;

    // Conductor actualmente asignado al camión.
    private String conductor;

    // Indica si el camión está marcado como activo.
    private boolean activo;

    // Estado operativo inicial del camión.
    // Por ejemplo: "operativo" o "averiado".
    private String estado = "operativo";


    /**
     * Constructor vacío requerido por JPA
     * para crear objetos al recuperar datos de la base de datos.
     */
    public Camion(){

    }


    /**
     * Construye un camión con sus datos iniciales.
     *
     * El estado se inicializa como "operativo"
     * mediante el valor predeterminado del atributo.
     *
     * @param id identificador único del camión
     * @param nombre nombre del camión
     * @param conductor conductor asignado
     * @param activo indica si el camión está activo
     */
    public Camion(int id, String nombre, String conductor, boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.conductor = conductor;
        this.activo = activo;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getConductor() {
        return conductor;
    }

    public void setConductor(String conductor) {
        this.conductor = conductor;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

}
