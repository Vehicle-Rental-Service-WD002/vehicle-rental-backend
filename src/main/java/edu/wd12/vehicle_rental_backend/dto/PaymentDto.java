package edu.wd12.vehicle_rental_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {
    private Long rentalId;
    private String cardNumber;
    private String paymentMethod;
}

