package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.LoginRequestDto;
import edu.wd12.vehicle_rental_backend.dto.LoginResponseDto;
import edu.wd12.vehicle_rental_backend.exception.ApiResponse;
import edu.wd12.vehicle_rental_backend.service.AuthUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    final AuthUserService authUserService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>(
                        true,
                        "Login successful",
                        authUserService.login(loginRequestDto)
                ));
    }
}
