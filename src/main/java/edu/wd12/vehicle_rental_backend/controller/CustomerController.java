package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.CustomerDto;
import edu.wd12.vehicle_rental_backend.entity.CustomerEntity;
import edu.wd12.vehicle_rental_backend.exception.ApiResponse;
import edu.wd12.vehicle_rental_backend.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/customers")
@RequiredArgsConstructor
@CrossOrigin
public class CustomerController {

    final CustomerService customerService;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerEntity>> createCustomer(@Valid @RequestBody CustomerDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Customer created successfully",
                        customerService.createCustomer(dto)
        ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerEntity>>> getAllCustomers() {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>(
                        true,
                        "Customers retrieved successfully",
                        customerService.getAllCustomers()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerEntity>> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Customer retrieved successfully",
                        customerService.getCustomerById(id)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerEntity>> updateCustomer(@PathVariable long id, @Valid @RequestBody CustomerDto dto) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Customer updated successfully",
                        customerService.updateCustomer(id, dto)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Customer deleted successfully",
                        null
        ));

    }

}
