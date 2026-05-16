package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.VehicleDto;
import edu.wd12.vehicle_rental_backend.entity.VehicleEntity;
import edu.wd12.vehicle_rental_backend.exception.ApiResponse;
import edu.wd12.vehicle_rental_backend.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@CrossOrigin
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleEntity>> createVehicle(@Valid @RequestBody VehicleDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Vehicle created successfully",
                        vehicleService.createVehicle(dto)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleEntity>>> getAllVehicles() {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Vehicles retrieved successfully",
                        vehicleService.getAllVehicles()
                ));

    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VehicleEntity>>> getAvailableVehicles() {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Available vehicles retrieved successfully",
                        vehicleService.getAvailableVehicles()
                ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleEntity>> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Vehicle retrieved successfully",
                        vehicleService.getVehicleById(id)
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleEntity>> updateVehicle(@PathVariable Long id, @Valid @RequestBody VehicleDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Vehicle updated successfully",
                        vehicleService.updateVehicle(id, dto)
                ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Vehicle deleted successfully",
                        null
                ));
    }

}
