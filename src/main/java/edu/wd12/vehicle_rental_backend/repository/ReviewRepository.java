package edu.wd12.vehicle_rental_backend.repository;

import edu.wd12.vehicle_rental_backend.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    boolean existsByRentalId(Long rentalId);
}
