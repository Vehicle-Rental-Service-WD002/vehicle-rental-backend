package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.dto.DriverDto;
import edu.wd12.vehicle_rental_backend.entity.DriverEntity;
import edu.wd12.vehicle_rental_backend.repository.DriverRepository;
import edu.wd12.vehicle_rental_backend.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    @Override
    public DriverEntity createDriver(DriverDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        DriverEntity driver = new DriverEntity();
        driver.setUsername(dto.getUsername());
        driver.setEmail(dto.getEmail());
        driver.setPassword(dto.getPassword());
        driver.setPhoneNumber(dto.getPhoneNumber());
        driver.setLicenseNumber(dto.getLicenseNumber());
        driver.setLicenseType(dto.getLicenseType());

        return driverRepository.save(driver);
    }

    @Override
    public List<DriverEntity> getAllDrivers() {
        return driverRepository.findAll();
    }

    @Override
    public DriverEntity getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Driver not found!"));
    }

    @Override
    public DriverEntity updateDriver(Long id, DriverDto dto) {
        DriverEntity existingDriver = getDriverById(id);

        existingDriver.setUsername(dto.getUsername());
        existingDriver.setLicenseNumber(dto.getLicenseType());
        existingDriver.setLicenseType(dto.getLicenseType());
        existingDriver.setEmail(dto.getEmail());
        existingDriver.setPhoneNumber(dto.getPhoneNumber());

        return driverRepository.save(existingDriver);
    }

    @Override
    public void deleteDriver(Long id) {
        driverRepository.deleteById(id);
    }
}


