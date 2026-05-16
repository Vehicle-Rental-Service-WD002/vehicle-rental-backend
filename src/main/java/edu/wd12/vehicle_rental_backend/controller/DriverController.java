package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.DriverDto;
import edu.wd12.vehicle_rental_backend.entity.DriverEntity;
import edu.wd12.vehicle_rental_backend.exception.ApiResponse;
import edu.wd12.vehicle_rental_backend.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/drivers")
@RequiredArgsConstructor
@CrossOrigin
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    public ResponseEntity<ApiResponse<DriverEntity>> createDriver(@Valid @RequestBody DriverDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(
                        true,
                        "Driver created successfully",
                        driverService.createDriver(dto)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverEntity>>> getAllDrivers() {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Drivers retrieved successfully",
                        driverService.getAllDrivers()
                ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverEntity>> getDriverById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Driver retrieved successfully",
                        driverService.getDriverById(id)
                ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverEntity>> updateDriver(@PathVariable long id, @Valid @RequestBody DriverDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Driver updated successfully",
                        driverService.updateDriver(id, dto)
                ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Driver deleted successfully",
                        null
                ));
    }
}
