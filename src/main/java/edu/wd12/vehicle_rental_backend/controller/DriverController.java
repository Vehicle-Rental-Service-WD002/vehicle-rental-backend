package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.DriverDto;
import edu.wd12.vehicle_rental_backend.entity.DriverEntity;
import edu.wd12.vehicle_rental_backend.service.DriverService;
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

    // CREATE (POST /api/drivers)
    @PostMapping
    public ResponseEntity<DriverEntity> createAdmin(@RequestBody DriverDto dto) {
        return new ResponseEntity<>(driverService.createDriver(dto), HttpStatus.CREATED);
    }

    // READ ALL (GET /api/admins)
    @GetMapping
    public ResponseEntity<List<DriverEntity>> getAllDrivers() {
        return new ResponseEntity<>(driverService.getAllDrivers(), HttpStatus.OK);
    }

    // READ ONE (GET /api/admins/{id})
    @GetMapping("/{id}")
    public ResponseEntity<DriverEntity> getDriverById(@PathVariable Long id) {
        return new ResponseEntity<>(driverService.getDriverById(id), HttpStatus.OK);
    }

    // UPDATE (PUT /api/admins/{id})
    @PutMapping("/{id}")
    public ResponseEntity<DriverEntity> updateCustomer(@PathVariable long id, @RequestBody DriverDto dto) {
        return new ResponseEntity<>(driverService.updateDriver(id, dto), HttpStatus.OK);
    }

    // DELETE (DELETE /api/admins/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return new ResponseEntity<>("Driver deleted successfully!", HttpStatus.OK);
    }
}
