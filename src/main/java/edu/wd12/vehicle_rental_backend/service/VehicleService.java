package edu.wd12.vehicle_rental_backend.service;

import edu.wd12.vehicle_rental_backend.dto.VehicleDto;
import edu.wd12.vehicle_rental_backend.entity.VehicleEntity;

import java.util.List;

public interface VehicleService {
    VehicleEntity createVehicle(VehicleDto dto);
    List<VehicleEntity> getAllVehicles();
    List<VehicleEntity> getAvailableVehicles();
    VehicleEntity getVehicleById(Long id);
    VehicleEntity updateVehicle(Long id, VehicleDto dto);
    void deleteVehicle(Long id);
}