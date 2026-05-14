package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.LoginRequestDto;
import edu.wd12.vehicle_rental_backend.dto.LoginResponseDto;
import edu.wd12.vehicle_rental_backend.service.AuthUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    final AuthUserService authUserService;

    @RequestMapping("login")
    public LoginResponseDto login(@RequestBody LoginRequestDto loginRequestDto) {
        return authUserService.login(loginRequestDto);
    }
}
