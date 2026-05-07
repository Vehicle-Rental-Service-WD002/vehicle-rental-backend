package edu.wd12.vehicle_rental_backend.repository;

import edu.wd12.vehicle_rental_backend.entity.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<CustomerEntity,Long> {

}
