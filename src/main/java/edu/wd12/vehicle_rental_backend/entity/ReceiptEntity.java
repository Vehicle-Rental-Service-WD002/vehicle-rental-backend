package edu.wd12.vehicle_rental_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="Receipts")
public class ReceiptEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "rental_id", nullable = false)
    private RentalEntity rental;

    private String receiptNumber;

    private double baseCost;

    private double lateFee = 0.0;

    private double finalTotal;

    private boolean isVoided = false;
}
