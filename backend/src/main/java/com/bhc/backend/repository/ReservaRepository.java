package com.bhc.backend.repository;

import com.bhc.backend.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio encargado del acceso a los datos de las reservas.
 *
 * Extiende JpaRepository para disponer automáticamente
 * de operaciones como guardar, buscar, listar y eliminar reservas,
 * sin necesidad de implementar manualmente estos métodos.
 *
 * Trabaja con la entidad Reserva, cuyo identificador es Integer.
 */
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

}
