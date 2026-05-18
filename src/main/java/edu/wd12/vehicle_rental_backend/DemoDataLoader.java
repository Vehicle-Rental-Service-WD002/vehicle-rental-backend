package edu.wd12.vehicle_rental_backend;

import edu.wd12.vehicle_rental_backend.entity.AdminEntity;
import edu.wd12.vehicle_rental_backend.entity.CustomerEntity;
import edu.wd12.vehicle_rental_backend.entity.DriverEntity;
import edu.wd12.vehicle_rental_backend.entity.VehicleEntity;
import edu.wd12.vehicle_rental_backend.repository.AdminRepository;
import edu.wd12.vehicle_rental_backend.repository.DriverRepository;
import edu.wd12.vehicle_rental_backend.repository.UserRepository;
import edu.wd12.vehicle_rental_backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
@RequiredArgsConstructor
public class DemoDataLoader implements CommandLineRunner {
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final AdminRepository adminRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Load dummy customers
        if (userRepository.count() == 0) {
            // Customer 1
            CustomerEntity customer1 = new CustomerEntity();
            customer1.setUsername("John Doe");
            customer1.setEmail("john@customer.com");
            customer1.setPassword(passwordEncoder.encode("password123"));
            customer1.setPhoneNumber("0123456789");
            customer1.setNationalId("NID-0001");
            userRepository.save(customer1);

            // Customer 2
            CustomerEntity customer2 = new CustomerEntity();
            customer2.setUsername("Jane Smith");
            customer2.setEmail("jane@customer.com");
            customer2.setPassword(passwordEncoder.encode("password123"));
            customer2.setPhoneNumber("0987654321");
            customer2.setNationalId("NID-0002");
            userRepository.save(customer2);

            // Driver 1
            DriverEntity driver1 = new DriverEntity();
            driver1.setUsername("Mike Johnson");
            driver1.setEmail("mike@driver.com");
            driver1.setPassword(passwordEncoder.encode("password123"));
            driver1.setPhoneNumber("0111222333");
            driver1.setLicenseNumber("DL-2025-0001");
            driver1.setLicenseType("Commercial");
            driverRepository.save(driver1);

            // Driver 2
            DriverEntity driver2 = new DriverEntity();
            driver2.setUsername("Sarah Williams");
            driver2.setEmail("sarah@driver.com");
            driver2.setPassword(passwordEncoder.encode("password123"));
            driver2.setPhoneNumber("0444555666");
            driver2.setLicenseNumber("DL-2025-0002");
            driver2.setLicenseType("Standard");
            driverRepository.save(driver2);

            // Admin
            AdminEntity admin = new AdminEntity();
            admin.setUsername("Admin User");
            admin.setEmail("admin@admin.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhoneNumber("0777888999");
            admin.setAccessLevel("FULL_ACCESS");
            adminRepository.save(admin);
        }

        // Load dummy vehicles
        if (vehicleRepository.count() == 0) {
            VehicleEntity v1 = new VehicleEntity();
            v1.setBrand("Toyota");
            v1.setModel("Corolla");
            v1.setYear(2020);
            v1.setDailyRate(35.0);
            v1.setType("Sedan");
            v1.setAvailable(true);
            vehicleRepository.save(v1);

            VehicleEntity v2 = new VehicleEntity();
            v2.setBrand("Honda");
            v2.setModel("CR-V");
            v2.setYear(2021);
            v2.setDailyRate(50.0);
            v2.setType("SUV");
            v2.setAvailable(true);
            vehicleRepository.save(v2);
        }
    }
}

