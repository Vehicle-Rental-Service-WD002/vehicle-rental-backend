package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.dto.PaymentDto;
import edu.wd12.vehicle_rental_backend.entity.PaymentEntity;
import edu.wd12.vehicle_rental_backend.repository.PaymentRepository;
import edu.wd12.vehicle_rental_backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RentalRepository rentalRepository;

    @Override
    public PaymentEntity processPayment(PaymentDto dto) {

        RentalEntity rental = rentalRepository.findById(dto.getRentalId())
                .orElseThrow(() -> new RuntimeException("Error: Rental not found!"));

        if (rental.getStatus().equals("PAID")) {
            throw new RuntimeException("Error: This rental has already been paid for.");
        }

        if (dto.getCardNumber() == null || dto.getCardNumber().length() != 16) {
            throw new RuntimeException("Payment Failed: Invalid Credit Card Number!");
        }

        PaymentEntity payment = new PaymentEntity();
        payment.setRental(rental);
        payment.setAmountPaid(rental.getTotalCost());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setPaymentMethod(dto.getPaymentMethod());

        PaymentEntity savedPayment = paymentRepository.save(payment);

        rental.setStatus("PAID");
        rentalRepository.save(rental);

        return savedPayment;
    }
}
