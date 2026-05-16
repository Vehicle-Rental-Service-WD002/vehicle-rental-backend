package edu.wd12.vehicle_rental_backend;

import edu.wd12.vehicle_rental_backend.entity.CustomerEntity;
import edu.wd12.vehicle_rental_backend.entity.VehicleEntity;
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
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            CustomerEntity c = new CustomerEntity();
            c.setUsername("Demo Customer");
            c.setEmail("demo@customer.com");
            c.setPassword(passwordEncoder.encode("password"));
            c.setPhoneNumber("0123456789");
            c.setNationalId("NID-0001");
            userRepository.save(c);
        }

        if (vehicleRepository.count() == 0) {
            VehicleEntity v = new VehicleEntity();
            v.setBrand("Toyota");
            v.setModel("Corolla");
            v.setYear(2020);
            v.setDailyRate(35.0);
            v.setType("Sedan");
            v.setAvailable(true);
            vehicleRepository.save(v);
        }
    }
}

