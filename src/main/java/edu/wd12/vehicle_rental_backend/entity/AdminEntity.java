package edu.wd12.vehicle_rental_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Admins")
@Entity
public class AdminEntity extends UserEntity{
    private String accessLevel;

}
