package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.dto.ReviewDto;
import edu.wd12.vehicle_rental_backend.entity.ReviewEntity;
import edu.wd12.vehicle_rental_backend.repository.ReviewRepository;
import edu.wd12.vehicle_rental_backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RentalRepository rentalRepository; // Needed to check the Rental status!

    @Override
    public ReviewEntity submitReview(ReviewDto dto) {

        RentalEntity rental = rentalRepository.findById(dto.getRentalId())
                .orElseThrow(() -> new RuntimeException("Error: Rental not found!"));

        if (!rental.getStatus().equals("COMPLETED") && !rental.getStatus().equals("PAID")) {
            throw new RuntimeException("Error: You can only review a completed rental!");
        }

        if (reviewRepository.existsByRentalId(dto.getRentalId())) {
            throw new RuntimeException("Error: You have already submitted a review for this trip.");
        }

        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new RuntimeException("Error: Rating must be between 1 and 5.");
        }

        ReviewEntity review = new ReviewEntity();
        review.setRental(rental);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setReviewDate(LocalDate.now());

        return reviewRepository.save(review);
    }

    @Override
    public List<ReviewEntity> getAllReviews() {
        return reviewRepository.findAll();
    }

    @Override
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
}

