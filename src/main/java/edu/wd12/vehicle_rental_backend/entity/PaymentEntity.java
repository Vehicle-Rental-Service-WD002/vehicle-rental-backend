package edu.wd12.vehicle_rental_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "payments")
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "rental_id", nullable = false)
    private RentalEntity rental;

    private double amountPaid;

    private LocalDateTime paymentDate;

    private String transactionId;

    private String paymentMethod;
}

