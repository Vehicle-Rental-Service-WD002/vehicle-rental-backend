package edu.wd12.vehicle_rental_backend.repository;

import edu.wd12.vehicle_rental_backend.entity.ReceiptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReceiptRepository extends JpaRepository<ReceiptEntity, Long> {

    Optional<ReceiptEntity> findByRentalId(Long rentalId);
}