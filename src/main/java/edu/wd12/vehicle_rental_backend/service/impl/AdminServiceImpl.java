package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.dto.AdminDto;
import edu.wd12.vehicle_rental_backend.entity.AdminEntity;
import edu.wd12.vehicle_rental_backend.exception.DuplicateResourceException;
import edu.wd12.vehicle_rental_backend.exception.ResourceNotFoundException;
import edu.wd12.vehicle_rental_backend.repository.AdminRepository;
import edu.wd12.vehicle_rental_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import edu.wd12.vehicle_rental_backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AdminEntity createAdmin(AdminDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email is already in use");
        }

        AdminEntity admin = new AdminEntity();
        admin.setUsername(dto.getUsername());
        admin.setEmail(dto.getEmail());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));
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
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + id));
    }

    @Override
    public AdminEntity updateAdmin(Long id, AdminDto dto) {
        AdminEntity existingAdmin = getAdminById(id);

        userRepository.findByEmail(dto.getEmail())
                .filter(user -> !user.getId().equals(id))
                .ifPresent(user -> {
                    throw new DuplicateResourceException("Email is already in use");
                });

        existingAdmin.setUsername(dto.getUsername());
        existingAdmin.setAccessLevel(dto.getAccessLevel());
        existingAdmin.setEmail(dto.getEmail());
        existingAdmin.setPassword(passwordEncoder.encode(dto.getPassword()));
        existingAdmin.setPhoneNumber(dto.getPhoneNumber());
        return adminRepository.save(existingAdmin);
    }

    @Override
    public void deleteAdmin(Long id) {
        if (!adminRepository.existsById(id)) {
            throw new ResourceNotFoundException("Admin not found with id: " + id);
        }
        adminRepository.deleteById(id);
    }
}
