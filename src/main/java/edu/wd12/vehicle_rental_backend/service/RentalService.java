package edu.wd12.vehicle_rental_backend.service;

import edu.wd12.vehicle_rental_backend.dto.RentalDto;
import edu.wd12.vehicle_rental_backend.entity.RentalEntity;

import java.util.List;

public interface RentalService {
    RentalEntity createRental(RentalDto dto);
    List<RentalEntity> getAllRentals();
    RentalEntity getRentalById(Long id);
    RentalEntity completeRental(Long id);
}
