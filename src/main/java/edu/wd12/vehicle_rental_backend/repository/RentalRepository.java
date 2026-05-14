package edu.wd12.vehicle_rental_backend.repository;

import edu.wd12.vehicle_rental_backend.entity.RentalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface RentalRepository extends JpaRepository<RentalEntity, Long> {

    @Query("SELECT COUNT(r) > 0 FROM RentalEntity r WHERE r.driver.id = :driverId " +
            "AND r.status IN ('ACTIVE', 'PAID') " +
            "AND r.startDate <= :endDate AND r.endDate >= :startDate")
    boolean isDriverDoubleBooked(
            @Param("driverId") Long driverId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}