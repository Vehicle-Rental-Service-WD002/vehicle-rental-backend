package edu.wd12.vehicle_rental_backend.service;

import edu.wd12.vehicle_rental_backend.dto.PaymentDto;
import edu.wd12.vehicle_rental_backend.entity.PaymentEntity;

public interface PaymentService {
    PaymentEntity processPayment(PaymentDto dto);
}
