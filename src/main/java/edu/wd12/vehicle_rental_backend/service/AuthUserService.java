package edu.wd12.vehicle_rental_backend.service;

import edu.wd12.vehicle_rental_backend.dto.LoginRequestDto;
import edu.wd12.vehicle_rental_backend.dto.LoginResponseDto;

public interface AuthUserService {

    LoginResponseDto login(LoginRequestDto loginRequestDto);

}
