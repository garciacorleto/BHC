package com.bhc.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Clase principal del backend de BHC.
 *
 * Es el punto de entrada de la aplicación Spring Boot.
 *
 * Al iniciarse, Spring Boot configura los componentes
 * necesarios para ejecutar la API REST, incluyendo
 * los controladores, repositorios y la conexión
 * con la base de datos.
 */
@SpringBootApplication
public class BackendApplication {

	/**
	 * Método principal que inicia la aplicación.
	 *
	 * @param args argumentos recibidos desde la línea de comandos
	 */
	public static void main(String[] args) {

		SpringApplication.run(BackendApplication.class, args);
	}

}