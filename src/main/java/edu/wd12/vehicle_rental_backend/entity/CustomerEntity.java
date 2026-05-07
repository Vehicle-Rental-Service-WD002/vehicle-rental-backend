package edu.wd12.vehicle_rental_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="Customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerEntity extends UserEntity{

    private String licenseNumber;
}
