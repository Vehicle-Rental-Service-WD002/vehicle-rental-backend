package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.dto.LoginRequestDto;
import edu.wd12.vehicle_rental_backend.dto.LoginResponseDto;
import edu.wd12.vehicle_rental_backend.entity.AdminEntity;
import edu.wd12.vehicle_rental_backend.entity.CustomerEntity;
import edu.wd12.vehicle_rental_backend.entity.DriverEntity;
import edu.wd12.vehicle_rental_backend.entity.UserEntity;
import edu.wd12.vehicle_rental_backend.exception.InvalidInputException;
import edu.wd12.vehicle_rental_backend.exception.ResourceNotFoundException;
import edu.wd12.vehicle_rental_backend.repository.UserRepository;
import edu.wd12.vehicle_rental_backend.service.AuthUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthUserServiceImpl implements AuthUserService {

    final UserRepository userRepository;
    final PasswordEncoder passwordEncoder;

    @Override
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {

        UserEntity userEntity = userRepository.findByEmail(loginRequestDto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginRequestDto.getEmail()));

        if(!passwordEncoder.matches(loginRequestDto.getPassword(), userEntity.getPassword())) {
            throw new InvalidInputException("Invalid email or password");
        }

        String role = "UNKNOWN";

        if (userEntity instanceof AdminEntity admin) {
            role = admin.getAccessLevel();
        }
        else if (userEntity instanceof DriverEntity) {
            role = "DRIVER";
        }
        else if (userEntity instanceof CustomerEntity) {
            role = "customer";
        }

        return new LoginResponseDto(userEntity.getId(), userEntity.getUsername(), role);
    }
}
