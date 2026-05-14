package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.dto.AdminDto;
import edu.wd12.vehicle_rental_backend.entity.AdminEntity;
import edu.wd12.vehicle_rental_backend.repository.AdminRepository;
import edu.wd12.vehicle_rental_backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;

    @Override
    public AdminEntity createAdmin(AdminDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        AdminEntity admin = new AdminEntity();
        admin.setUsername(dto.getUsername());
        admin.setEmail(dto.getEmail());
        admin.setPassword(dto.getPassword());
        admin.setAccessLevel(dto.getAccessLevel());
        admin.setPhoneNumber(dto.getPhoneNumber());

        return adminRepository.save(admin);
    }

    @Override
    public List<AdminEntity> getAllAdmins() {
        return adminRepository.findAll();
    }

    @Override
    public AdminEntity getAdminById(Long id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Admin not found!"));
    }

    @Override
    public AdminEntity updateAdmin(Long id, AdminDto dto) {
        AdminEntity existingAdmin = getAdminById(id);
        existingAdmin.setUsername(dto.getUsername());
        existingAdmin.setAccessLevel(dto.getAccessLevel());
        existingAdmin.setEmail(dto.getEmail());
        existingAdmin.setPassword(dto.getPassword());
        existingAdmin.setPhoneNumber(dto.getPhoneNumber());
        return adminRepository.save(existingAdmin);
    }

    @Override
    public void deleteAdmin(Long id) {
        adminRepository.deleteById(id);
    }
}
