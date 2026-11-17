package com.bhc.backend.controller;

import com.bhc.backend.repository.CamionRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.bhc.backend.model.Camion;
import java.util.List;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controlador REST encargado de gestionar los camiones de BHC.
 *
 * Permite consultar los camiones, modificar su estado operativo
 * y actualizar el conductor asignado.
 *
 * También inicializa los camiones de la empresa cuando
 * la base de datos todavía no contiene ninguno.
 */
@RestController
@CrossOrigin(origins = "http://localhost:5501")
public class CamionController {

    private final CamionRepository camionRepository;

    /**
     * Recibe el repositorio mediante inyección de dependencias.
     *
     * Spring proporciona automáticamente la implementación
     * de CamionRepository.
     *
     * @param camionRepository repositorio de camiones
     */
    public CamionController(CamionRepository camionRepository) {
        this.camionRepository = camionRepository;
    }


    /**
     * Inicializa los camiones de BHC al arrancar la aplicación.
     *
     * Si la tabla de camiones está vacía, crea los tres camiones
     * iniciales con sus respectivos conductores.
     *
     * También asigna el estado "operativo" a los camiones
     * existentes cuyo estado sea null.
     *
     * No modifica los estados que ya estén guardados.
     */
    @PostConstruct
    public void inicializarCamiones() {
        // Los camiones iniciales solo se crean si no existe ninguno.
        // Así evitamos sobrescribir los datos guardados en H2.
        if (camionRepository.count() == 0) {
            camionRepository.save(new Camion(1, "Camión 1", "Pedro", true));
            camionRepository.save(new Camion(2, "Camión 2", "Juan", true));
            camionRepository.save(new Camion(3, "Camión 3", "Carlos", true));
        }

        // Compatibilidad con registros antiguos que no tenían estado.
        for (Camion camion : camionRepository.findAll()) {
            if (camion.getEstado() == null) {
                camion.setEstado("operativo");
                camionRepository.save(camion);
            }
        }
    }

    /**
     * Obtiene todos los camiones almacenados en la base de datos.
     *
     * Endpoint: GET /camiones
     *
     * @return lista completa de camiones
     */
    @GetMapping("/camiones")
    public List<Camion> obtenerCamiones() {
        return camionRepository.findAll();
    }


    /**
     * Actualiza el estado operativo de un camión.
     *
     * Endpoint: PATCH /camiones/{id}/estado
     *
     * El nuevo estado se recibe como texto en el cuerpo
     * de la petición HTTP.
     *
     * Respuestas de error:
     * - HTTP 404: camión no encontrado.
     *
     * @param id identificador del camión
     * @param nuevoEstado nuevo estado operativo
     * @return camión actualizado
     */
    @PatchMapping("/camiones/{id}/estado")
    public Camion cambiarEstado(@PathVariable int id, @RequestBody String nuevoEstado) {

        // Busca el camión y devuelve HTTP 404 si no existe.
        Camion camion = camionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Camión no encontrado"
                ));

        // Actualiza el estado y lo guarda de forma persistente.
        camion.setEstado(nuevoEstado);

        return camionRepository.save(camion);
    }

    /**
     * Cambia el conductor asignado a un camión.
     *
     * Endpoint: PATCH /camiones/{id}/conductor
     *
     * El nombre del nuevo conductor se recibe como texto
     * en el cuerpo de la petición HTTP.
     *
     * Respuestas de error:
     * - HTTP 404: camión no encontrado.
     *
     * @param id identificador del camión
     * @param nuevoConductor nombre del conductor que se asignará
     * @return camión actualizado
     */
    @PatchMapping("/camiones/{id}/conductor")
    public Camion cambiarConductor(@PathVariable int id, @RequestBody String nuevoConductor) {

        // Busca el camión y devuelve HTTP 404 si no existe.
        Camion camion = camionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Camión no encontrado"
                ));

        // Actualiza el conductor y guarda el cambio en H2.
        camion.setConductor(nuevoConductor);

        return camionRepository.save(camion);
    }
}
