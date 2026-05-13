package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.PaymentDto;
import edu.wd12.vehicle_rental_backend.entity.PaymentEntity;
import edu.wd12.vehicle_rental_backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentEntity> processPayment(@RequestBody PaymentDto dto) {
        return new ResponseEntity<>(paymentService.processPayment(dto), HttpStatus.CREATED);
    }
}
