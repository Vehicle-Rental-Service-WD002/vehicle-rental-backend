package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.entity.ReceiptEntity;
import edu.wd12.vehicle_rental_backend.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @PostMapping("/generate/{rentalId}")
    public ResponseEntity<ReceiptEntity> generateReceipt(@PathVariable Long rentalId) {
        return new ResponseEntity<>(receiptService.generateReceipt(rentalId), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceiptEntity> viewReceipt(@PathVariable Long id) {
        return new ResponseEntity<>(receiptService.viewReceipt(id), HttpStatus.OK);
    }

    @PutMapping("/{id}/late-fee")
    public ResponseEntity<ReceiptEntity> updateLateFee(@PathVariable Long id, @RequestParam double fee) {
        return new ResponseEntity<>(receiptService.updateLateFee(id, fee), HttpStatus.OK);
    }

    @DeleteMapping("/{id}/void")
    public ResponseEntity<String> voidReceipt(@PathVariable Long id) {
        receiptService.voidReceipt(id);
        return new ResponseEntity<>("Receipt has been successfully voided.", HttpStatus.OK);
    }
}
