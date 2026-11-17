package com.bhc.backend.repository;

import com.bhc.backend.model.Camion;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio encargado del acceso a los datos de los camiones.
 *
 * Extiende JpaRepository para disponer automáticamente
 * de operaciones de consulta, guardado, actualización
 * y eliminación de camiones.
 *
 * Trabaja con la entidad Camion, cuyo identificador
 * es de tipo int (Integer en JpaRepository).
 */
public interface CamionRepository extends JpaRepository<Camion, Integer> {

}
