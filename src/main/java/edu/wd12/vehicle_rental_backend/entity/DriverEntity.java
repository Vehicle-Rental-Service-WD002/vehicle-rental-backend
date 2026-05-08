package edu.wd12.vehicle_rental_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Drivers")
@Entity
public class DriverEntity extends UserEntity{
    private String vehicleLicenseType;
}
