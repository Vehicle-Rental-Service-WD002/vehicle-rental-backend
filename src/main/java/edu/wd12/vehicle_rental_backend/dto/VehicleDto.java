package edu.wd12.vehicle_rental_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    private String brand;
    private String model;
    private double dailyRate;
    private int year;
    private String type;
    private String vehicleNumber;
}
