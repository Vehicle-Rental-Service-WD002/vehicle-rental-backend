package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.dto.LoginRequestDto;
import edu.wd12.vehicle_rental_backend.dto.LoginResponseDto;
import edu.wd12.vehicle_rental_backend.entity.AdminEntity;
import edu.wd12.vehicle_rental_backend.entity.DriverEntity;
import edu.wd12.vehicle_rental_backend.service.AuthUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthUserServiceImpl implements AuthUserService {

    final UserRepository userRepository;

    @Override
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {

        UserEntity userEntity = userRepository.findByEmail(loginRequestDto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + loginRequestDto.getEmail()));

        if(!userEntity.getPassword().equals(loginRequestDto.getPassword())) {
            throw new RuntimeException("Passwords don't match");
        }

        // 3. Determine their exact role based on their child class
        String role = "UNKNOWN";

        if (userEntity instanceof AdminEntity) {
            AdminEntity admin = (AdminEntity) userEntity;
            role = admin.getAccessLevel(); // e.g., "SUPER_ADMIN" or "MANAGER"
        }
        else if (userEntity instanceof DriverEntity) {
            role = "DRIVER";
        }
        else if (userEntity instanceof CustomerEntity) {
            role = "CUSTOMER";
        }

        // 4. Return the safe data back to the frontend
        try {
            return new LoginResponseDto(userEntity.getId(), userEntity.getUsername(), role);
        } catch (Exception e) {
            throw new  RuntimeException("Error creating LoginResponseDto: " + e.getMessage());
        }

    }
}
