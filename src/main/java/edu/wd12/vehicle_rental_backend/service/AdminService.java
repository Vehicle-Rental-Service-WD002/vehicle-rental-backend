package edu.wd12.vehicle_rental_backend.service;

import edu.wd12.vehicle_rental_backend.dto.AdminDto;
import edu.wd12.vehicle_rental_backend.entity.AdminEntity;

import java.util.List;

public interface AdminService {
    AdminEntity createAdmin(AdminDto dto);
    List<AdminEntity> getAllAdmins();
    AdminEntity getAdminById(Long id);
    AdminEntity updateAdmin(Long id, AdminDto dto);
    void deleteAdmin(Long id);
}

