package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.entity.ReceiptEntity;
import edu.wd12.vehicle_rental_backend.repository.ReceiptRepository;
import edu.wd12.vehicle_rental_backend.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReceiptServiceImpl implements ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final RentalRepository rentalRepository;

    @Override
    public ReceiptEntity generateReceipt(Long rentalId) {

        RentalEntity rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Error: Rental not found!"));


        if (receiptRepository.findByRentalId(rentalId).isPresent()) {
            throw new RuntimeException("Error: Receipt already exists for this rental.");
        }

        ReceiptEntity receipt = new ReceiptEntity();
        receipt.setReceiptNumber("REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        receipt.setRental(rental);

        receipt.setBaseCost(rental.getTotalCost());
        receipt.setLateFee(0.0);
        receipt.setFinalTotal(calculateFinalTotal(receipt.getBaseCost(), receipt.getLateFee()));

        return receiptRepository.save(receipt);
    }

    @Override
    public ReceiptEntity viewReceipt(Long id) {
        return receiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Receipt not found!"));
    }

    @Override
    public ReceiptEntity updateLateFee(Long id, double fee) {
        ReceiptEntity receipt = viewReceipt(id);

        if (receipt.isVoided()) {
            throw new RuntimeException("Error: Cannot update a voided receipt.");
        }

        receipt.setLateFee(fee);
        receipt.setFinalTotal(calculateFinalTotal(receipt.getBaseCost(), fee));

        return receiptRepository.save(receipt);
    }

    @Override
    public void voidReceipt(Long id) {
        ReceiptEntity receipt = viewReceipt(id);
        receipt.setVoided(true);
        receiptRepository.save(receipt);
    }

    @Override
    public double calculateFinalTotal(double baseCost, double lateFee) {
        return baseCost + lateFee;
    }

}