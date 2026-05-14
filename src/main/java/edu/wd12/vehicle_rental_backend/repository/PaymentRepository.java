package edu.wd12.vehicle_rental_backend.repository;

import edu.wd12.vehicle_rental_backend.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
}