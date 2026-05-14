package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.ReviewDto;
import edu.wd12.vehicle_rental_backend.entity.ReviewEntity;
import edu.wd12.vehicle_rental_backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewEntity> submitReview(@RequestBody ReviewDto dto) {
        return new ResponseEntity<>(reviewService.submitReview(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ReviewEntity>> getAllReviews() {
        return new ResponseEntity<>(reviewService.getAllReviews(), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return new ResponseEntity<>("Review deleted successfully.", HttpStatus.OK);
    }
}
