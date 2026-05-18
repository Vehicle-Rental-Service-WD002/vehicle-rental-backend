package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.dto.RentalDto;
import edu.wd12.vehicle_rental_backend.entity.CustomerEntity;
import edu.wd12.vehicle_rental_backend.entity.DriverEntity;
import edu.wd12.vehicle_rental_backend.entity.RentalEntity;
import edu.wd12.vehicle_rental_backend.entity.VehicleEntity;
import edu.wd12.vehicle_rental_backend.exception.InvalidInputException;
import edu.wd12.vehicle_rental_backend.exception.ResourceNotFoundException;
import edu.wd12.vehicle_rental_backend.repository.CustomerRepository;
import edu.wd12.vehicle_rental_backend.repository.DriverRepository;
import edu.wd12.vehicle_rental_backend.repository.RentalRepository;
import edu.wd12.vehicle_rental_backend.repository.VehicleRepository;
import edu.wd12.vehicle_rental_backend.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RentalServiceImpl implements RentalService {

    private final RentalRepository rentalRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    @Override
    public RentalEntity createRental(RentalDto dto) {

        CustomerEntity customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + dto.getCustomerId()));

        VehicleEntity vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + dto.getVehicleId()));

        if (!vehicle.isAvailable()) {
            throw new InvalidInputException("This vehicle is currently rented out");
        }

        long daysRented = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate());
        if (daysRented < 0) {
            throw new InvalidInputException("End date cannot be before start date");
        }
        if (daysRented == 0) daysRented = 1; // Minimum 1 day charge

        double finalCost = daysRented * vehicle.getDailyRate();

        vehicle.setAvailable(false);
        vehicleRepository.save(vehicle);

        RentalEntity rental = new RentalEntity();
        rental.setCustomer(customer);
        rental.setVehicle(vehicle);
        rental.setStartDate(dto.getStartDate());
        rental.setEndDate(dto.getEndDate());

        if (dto.getDriverId() != null) {
            DriverEntity driver = driverRepository.findById(dto.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + dto.getDriverId()));

            boolean isDoubleBooked = rentalRepository.isDriverDoubleBooked(
                    driver.getId(), dto.getStartDate(), dto.getEndDate());

            if (isDoubleBooked) {
                throw new InvalidInputException("This driver is already booked for these dates");
            }
            if (!"Standard".equals(driver.getLicenseType())) {
                finalCost += 20 * daysRented;
            } else {
                finalCost += 10 * daysRented;
            }

            rental.setDriver(driver);
        }
        rental.setTotalCost(finalCost);
        return rentalRepository.save(rental);
    }

    @Override
    public List<RentalEntity> getAllRentals() {
        return rentalRepository.findAll();
    }

    @Override
    public RentalEntity getRentalById(Long id) {
        return rentalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Rental not found!"));
    }

    @Override
    public RentalEntity completeRental(Long id) {
        RentalEntity rental = getRentalById(id);

        if (rental.getStatus().equals("COMPLETED")) {
            throw new InvalidInputException("This rental is already completed");
        }

        rental.setStatus("COMPLETED");

        VehicleEntity vehicle = rental.getVehicle();
        vehicle.setAvailable(true);
        vehicleRepository.save(vehicle);

        return rentalRepository.save(rental);
    }
}
