package edu.wd12.vehicle_rental_backend.service;

import edu.wd12.vehicle_rental_backend.entity.ReceiptEntity;

import java.util.List;

public interface ReceiptService {
    ReceiptEntity generateReceipt(Long rentalId);
    ReceiptEntity viewReceipt(Long id);
    ReceiptEntity updateLateFee(Long id, double fee);
    List<ReceiptEntity> getAllRecipts();
    void voidReceipt(Long id);
    double calculateFinalTotal(double baseCost, double lateFee);
}
