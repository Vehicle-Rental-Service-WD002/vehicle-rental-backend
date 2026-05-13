package edu.wd12.vehicle_rental_backend.service;

import edu.wd12.vehicle_rental_backend.entity.ReceiptEntity;

public interface ReceiptService {
    ReceiptEntity generateReceipt(Long rentalId);
    ReceiptEntity viewReceipt(Long id);
    ReceiptEntity updateLateFee(Long id, double fee);
    void voidReceipt(Long id);
}
