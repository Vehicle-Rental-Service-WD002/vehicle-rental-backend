package edu.wd12.vehicle_rental_backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Vehicle Rental Backend API")
                        .version("1.0")
                        .description("API documentation for the Vehicle Rental Backend project")
                        .contact(new Contact().name("Project Team").email("noreply@example.com"))
                        .license(new License().name("MIT"))
                );
    }
}

