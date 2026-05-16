package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.RentalDto;
import edu.wd12.vehicle_rental_backend.entity.RentalEntity;
import edu.wd12.vehicle_rental_backend.exception.ApiResponse;
import edu.wd12.vehicle_rental_backend.service.RentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {
    private final RentalService rentalService;

    @PostMapping
    public ResponseEntity<ApiResponse<RentalEntity>> createRental(@Valid @RequestBody RentalDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(
                        true,
                        "Rental created successfully",
                        rentalService.createRental(dto)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RentalEntity>>> getAllRentals() {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Rentals retrieved successfully",
                        rentalService.getAllRentals()
                ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RentalEntity>> getRentalById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Rental retrieved successfully",
                        rentalService.getRentalById(id)
                ));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<RentalEntity>> completeRental(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Rental completed successfully",
                        rentalService.completeRental(id)
        ));
    }
}