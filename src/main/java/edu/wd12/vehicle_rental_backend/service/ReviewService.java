package edu.wd12.vehicle_rental_backend.service;

import edu.wd12.vehicle_rental_backend.dto.ReviewDto;
import edu.wd12.vehicle_rental_backend.entity.ReviewEntity;

import java.util.List;

public interface ReviewService {
    ReviewEntity submitReview(ReviewDto dto);
    List<ReviewEntity> getAllReviews();
    void deleteReview(Long id);
}
