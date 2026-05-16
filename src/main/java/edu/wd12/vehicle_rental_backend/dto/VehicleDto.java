package edu.wd12.vehicle_rental_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @Positive(message = "Daily rate must be greater than zero")
    private double dailyRate;

    @Min(value = 1900, message = "Year must be a valid model year")
    private int year;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;
}
