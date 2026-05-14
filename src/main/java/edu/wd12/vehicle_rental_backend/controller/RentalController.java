package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.RentalDto;
import edu.wd12.vehicle_rental_backend.entity.RentalEntity;
import edu.wd12.vehicle_rental_backend.service.RentalService;
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
    public ResponseEntity<RentalEntity> createRental(@RequestBody RentalDto dto) {
        return new ResponseEntity<>(rentalService.createRental(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RentalEntity>> getAllRentals() {
        return new ResponseEntity<>(rentalService.getAllRentals(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalEntity> getRentalById(@PathVariable Long id) {
        return new ResponseEntity<>(rentalService.getRentalById(id), HttpStatus.OK);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<RentalEntity> completeRental(@PathVariable Long id) {
        return new ResponseEntity<>(rentalService.completeRental(id), HttpStatus.OK);
    }
}