package edu.wd12.vehicle_rental_backend.service;

import edu.wd12.vehicle_rental_backend.dto.DriverDto;
import edu.wd12.vehicle_rental_backend.entity.DriverEntity;

import java.util.List;

public interface DriverService {
    DriverEntity createDriver(DriverDto dto);
    List<DriverEntity> getAllDrivers();
    DriverEntity getDriverById(Long id);
    DriverEntity updateDriver(Long id, DriverDto dto);
    void deleteDriver(Long id);
}
