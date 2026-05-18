package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.entity.ReceiptEntity;
import edu.wd12.vehicle_rental_backend.exception.ApiResponse;
import edu.wd12.vehicle_rental_backend.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
@CrossOrigin
public class ReceiptController {

    private final ReceiptService receiptService;

    @PostMapping("/generate/{rentalId}")
    public ResponseEntity<ApiResponse<ReceiptEntity>> generateReceipt(@PathVariable Long rentalId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ApiResponse<>(
                        true,
                        "Receipt generated successfully",
                        receiptService.generateReceipt(rentalId)
                ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReceiptEntity>> viewReceipt(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Receipt retrieved successfully",
                        receiptService.viewReceipt(id)
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReceiptEntity>>>viewReceipt(){
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "All Receipt retrieved successfully",
                        receiptService.getAllRecipts()
                ));
    }

    @PutMapping("/{id}/late-fee")
    public ResponseEntity<ApiResponse<ReceiptEntity>> updateLateFee(@PathVariable Long id, @RequestParam double fee) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Late fee updated successfully",
                        receiptService.updateLateFee(id, fee)
                ));
    }

    @DeleteMapping("/{id}/void")
    public ResponseEntity<ApiResponse<Void>> voidReceipt(@PathVariable Long id) {
        receiptService.voidReceipt(id);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponse<>(
                        true,
                        "Receipt voided successfully",
                        null
                ));
    }
}
