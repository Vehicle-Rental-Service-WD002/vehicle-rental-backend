package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.dto.VehicleDto;
import edu.wd12.vehicle_rental_backend.entity.VehicleEntity;
import edu.wd12.vehicle_rental_backend.exception.ResourceNotFoundException;
import edu.wd12.vehicle_rental_backend.repository.VehicleRepository;
import edu.wd12.vehicle_rental_backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    public VehicleEntity createVehicle(VehicleDto dto) {
        VehicleEntity vehicle = new VehicleEntity();
        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setYear(dto.getYear());
        vehicle.setDailyRate(dto.getDailyRate());
        vehicle.setType(dto.getType());
        vehicle.setAvailable(true);
        vehicle.setVehicleNumber(dto.getVehicleNumber());

        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<VehicleEntity> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Override
    public List<VehicleEntity> getAvailableVehicles() {
        return vehicleRepository.findByAvailableTrue();
    }

    @Override
    public VehicleEntity getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    @Override
    public VehicleEntity updateVehicle(Long id, VehicleDto dto) {
        VehicleEntity existingVehicle = getVehicleById(id);

        existingVehicle.setBrand(dto.getBrand());
        existingVehicle.setModel(dto.getModel());
        existingVehicle.setYear(dto.getYear());
        existingVehicle.setDailyRate(dto.getDailyRate());
        existingVehicle.setType(dto.getType());
        existingVehicle.setVehicleNumber(dto.getVehicleNumber());

        return vehicleRepository.save(existingVehicle);
    }

    @Override
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle not found with id: " + id);
        }
        vehicleRepository.deleteById(id);
    }
}
