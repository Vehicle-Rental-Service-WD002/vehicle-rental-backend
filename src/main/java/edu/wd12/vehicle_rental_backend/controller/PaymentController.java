package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.PaymentDto;
import edu.wd12.vehicle_rental_backend.entity.PaymentEntity;
import edu.wd12.vehicle_rental_backend.exception.ApiResponse;
import edu.wd12.vehicle_rental_backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentEntity>> processPayment(@Valid @RequestBody PaymentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(
                        true,
                        "Payment processed successfully",
                        paymentService.processPayment(dto)
                ));
    }
}
