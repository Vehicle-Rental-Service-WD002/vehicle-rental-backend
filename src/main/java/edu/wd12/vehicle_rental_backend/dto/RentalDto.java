package edu.wd12.vehicle_rental_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalDto {
    private Long customerId;
    private Long vehicleId;
    private Long driverId;
    private LocalDate startDate;
    private LocalDate endDate;
}
