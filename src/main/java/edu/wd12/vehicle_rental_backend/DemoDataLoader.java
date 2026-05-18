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

        if (userRepository.count() == 0) {
            // ============ CUSTOMERS (8 customers) ============
            CustomerEntity customer1 = new CustomerEntity();
            customer1.setUsername("John Doe");
            customer1.setEmail("john@customer.com");
            customer1.setPassword(passwordEncoder.encode("password123"));
            customer1.setPhoneNumber("0123456789");
            customer1.setNationalId("NID-0001");
            userRepository.save(customer1);

            CustomerEntity customer2 = new CustomerEntity();
            customer2.setUsername("Jane Smith");
            customer2.setEmail("jane@customer.com");
            customer2.setPassword(passwordEncoder.encode("password123"));
            customer2.setPhoneNumber("0987654321");
            customer2.setNationalId("NID-0002");
            userRepository.save(customer2);

            CustomerEntity customer3 = new CustomerEntity();
            customer3.setUsername("Bob Wilson");
            customer3.setEmail("bob@customer.com");
            customer3.setPassword(passwordEncoder.encode("password123"));
            customer3.setPhoneNumber("0555666777");
            customer3.setNationalId("NID-0003");
            userRepository.save(customer3);

            CustomerEntity customer4 = new CustomerEntity();
            customer4.setUsername("Alice Johnson");
            customer4.setEmail("alice@customer.com");
            customer4.setPassword(passwordEncoder.encode("password123"));
            customer4.setPhoneNumber("0888999000");
            customer4.setNationalId("NID-0004");
            userRepository.save(customer4);

            CustomerEntity customer5 = new CustomerEntity();
            customer5.setUsername("Charlie Brown");
            customer5.setEmail("charlie@customer.com");
            customer5.setPassword(passwordEncoder.encode("password123"));
            customer5.setPhoneNumber("0111222333");
            customer5.setNationalId("NID-0005");
            userRepository.save(customer5);

            CustomerEntity customer6 = new CustomerEntity();
            customer6.setUsername("Diana Prince");
            customer6.setEmail("diana@customer.com");
            customer6.setPassword(passwordEncoder.encode("password123"));
            customer6.setPhoneNumber("0444555666");
            customer6.setNationalId("NID-0006");
            userRepository.save(customer6);

            CustomerEntity customer7 = new CustomerEntity();
            customer7.setUsername("Emma Watson");
            customer7.setEmail("emma@customer.com");
            customer7.setPassword(passwordEncoder.encode("password123"));
            customer7.setPhoneNumber("0777888999");
            customer7.setNationalId("NID-0007");
            userRepository.save(customer7);

            CustomerEntity customer8 = new CustomerEntity();
            customer8.setUsername("Frank Miller");
            customer8.setEmail("frank@customer.com");
            customer8.setPassword(passwordEncoder.encode("password123"));
            customer8.setPhoneNumber("0333444555");
            customer8.setNationalId("NID-0008");
            userRepository.save(customer8);

            System.out.println("✓ Customers loaded: 8 customers");

            // ============ DRIVERS (6 drivers) ============
            DriverEntity driver1 = new DriverEntity();
            driver1.setUsername("Mike Johnson");
            driver1.setEmail("mike@driver.com");
            driver1.setPassword(passwordEncoder.encode("password123"));
            driver1.setPhoneNumber("0111222333");
            driver1.setLicenseNumber("DL-2025-0001");
            driver1.setLicenseType("Commercial");
            driverRepository.save(driver1);

            DriverEntity driver2 = new DriverEntity();
            driver2.setUsername("Sarah Williams");
            driver2.setEmail("sarah@driver.com");
            driver2.setPassword(passwordEncoder.encode("password123"));
            driver2.setPhoneNumber("0444555666");
            driver2.setLicenseNumber("DL-2025-0002");
            driver2.setLicenseType("Standard");
            driverRepository.save(driver2);

            DriverEntity driver3 = new DriverEntity();
            driver3.setUsername("David Brown");
            driver3.setEmail("david@driver.com");
            driver3.setPassword(passwordEncoder.encode("password123"));
            driver3.setPhoneNumber("0888999000");
            driver3.setLicenseNumber("DL-2025-0003");
            driver3.setLicenseType("Commercial");
            driverRepository.save(driver3);

            DriverEntity driver4 = new DriverEntity();
            driver4.setUsername("Lisa Anderson");
            driver4.setEmail("lisa@driver.com");
            driver4.setPassword(passwordEncoder.encode("password123"));
            driver4.setPhoneNumber("0555666777");
            driver4.setLicenseNumber("DL-2025-0004");
            driver4.setLicenseType("Standard");
            driverRepository.save(driver4);

            DriverEntity driver5 = new DriverEntity();
            driver5.setUsername("James Taylor");
            driver5.setEmail("james@driver.com");
            driver5.setPassword(passwordEncoder.encode("password123"));
            driver5.setPhoneNumber("0222333444");
            driver5.setLicenseNumber("DL-2025-0005");
            driver5.setLicenseType("Commercial");
            driverRepository.save(driver5);

            DriverEntity driver6 = new DriverEntity();
            driver6.setUsername("Rebecca Lee");
            driver6.setEmail("rebecca@driver.com");
            driver6.setPassword(passwordEncoder.encode("password123"));
            driver6.setPhoneNumber("0666777888");
            driver6.setLicenseNumber("DL-2025-0006");
            driver6.setLicenseType("Standard");
            driverRepository.save(driver6);

            System.out.println("✓ Drivers loaded: 6 drivers");

            // ============ ADMINS (3 admins) ============
            AdminEntity admin1 = new AdminEntity();
            admin1.setUsername("Admin User");
            admin1.setEmail("admin@admin.com");
            admin1.setPassword(passwordEncoder.encode("admin123"));
            admin1.setPhoneNumber("0777888999");
            admin1.setAccessLevel("FULL_ACCESS");
            adminRepository.save(admin1);

            AdminEntity admin2 = new AdminEntity();
            admin2.setUsername("Manager User");
            admin2.setEmail("manager@admin.com");
            admin2.setPassword(passwordEncoder.encode("admin123"));
            admin2.setPhoneNumber("0222333444");
            admin2.setAccessLevel("LIMITED_ACCESS");
            adminRepository.save(admin2);

            AdminEntity admin3 = new AdminEntity();
            admin3.setUsername("Supervisor User");
            admin3.setEmail("supervisor@admin.com");
            admin3.setPassword(passwordEncoder.encode("admin123"));
            admin3.setPhoneNumber("0999000111");
            admin3.setAccessLevel("FULL_ACCESS");
            adminRepository.save(admin3);

            System.out.println("✓ Admins loaded: 3 admins");
        }

        if (vehicleRepository.count() == 0) {

            // ============ SEDANS ============
            VehicleEntity v1 = new VehicleEntity();
            v1.setBrand("Toyota");
            v1.setModel("Corolla");
            v1.setYear(2020);
            v1.setDailyRate(35.0);
            v1.setType("Sedan");
            v1.setAvailable(true);
            v1.setVehicleNumber("ABC-001");
            vehicleRepository.save(v1);

            VehicleEntity v2 = new VehicleEntity();
            v2.setBrand("Honda");
            v2.setModel("Civic");
            v2.setYear(2021);
            v2.setDailyRate(38.0);
            v2.setType("Sedan");
            v2.setAvailable(true);
            v2.setVehicleNumber("ABC-002");
            vehicleRepository.save(v2);

            VehicleEntity v3 = new VehicleEntity();
            v3.setBrand("Hyundai");
            v3.setModel("Elantra");
            v3.setYear(2019);
            v3.setDailyRate(32.0);
            v3.setType("Sedan");
            v3.setAvailable(true);
            v3.setVehicleNumber("ABC-003");
            vehicleRepository.save(v3);

            VehicleEntity v4 = new VehicleEntity();
            v4.setBrand("Mazda");
            v4.setModel("3");
            v4.setYear(2021);
            v4.setDailyRate(40.0);
            v4.setType("Sedan");
            v4.setAvailable(true);
            v4.setVehicleNumber("ABC-004");
            vehicleRepository.save(v4);

            VehicleEntity v5 = new VehicleEntity();
            v5.setBrand("Mercedes");
            v5.setModel("C-Class");
            v5.setYear(2022);
            v5.setDailyRate(85.0);
            v5.setType("Sedan");
            v5.setAvailable(true);
            v5.setVehicleNumber("MER-001");
            vehicleRepository.save(v5);

            // ============ SUVs ============
            VehicleEntity v6 = new VehicleEntity();
            v6.setBrand("Honda");
            v6.setModel("CR-V");
            v6.setYear(2021);
            v6.setDailyRate(50.0);
            v6.setType("SUV");
            v6.setAvailable(true);
            v6.setVehicleNumber("ABC-005");
            vehicleRepository.save(v6);

            VehicleEntity v7 = new VehicleEntity();
            v7.setBrand("Toyota");
            v7.setModel("RAV4");
            v7.setYear(2020);
            v7.setDailyRate(52.0);
            v7.setType("SUV");
            v7.setAvailable(true);
            v7.setVehicleNumber("ABC-006");
            vehicleRepository.save(v7);

            VehicleEntity v8 = new VehicleEntity();
            v8.setBrand("Mazda");
            v8.setModel("CX-5");
            v8.setYear(2020);
            v8.setDailyRate(45.0);
            v8.setType("SUV");
            v8.setAvailable(true);
            v8.setVehicleNumber("ABC-007");
            vehicleRepository.save(v8);

            VehicleEntity v9 = new VehicleEntity();
            v9.setBrand("BMW");
            v9.setModel("X5");
            v9.setYear(2022);
            v9.setDailyRate(75.0);
            v9.setType("SUV");
            v9.setAvailable(true);
            v9.setVehicleNumber("BMW-001");
            vehicleRepository.save(v9);

            VehicleEntity v10 = new VehicleEntity();
            v10.setBrand("Audi");
            v10.setModel("Q7");
            v10.setYear(2021);
            v10.setDailyRate(80.0);
            v10.setType("SUV");
            v10.setAvailable(true);
            v10.setVehicleNumber("AUD-001");
            vehicleRepository.save(v10);

            VehicleEntity v11 = new VehicleEntity();
            v11.setBrand("Hyundai");
            v11.setModel("Creta");
            v11.setYear(2020);
            v11.setDailyRate(42.0);
            v11.setType("SUV");
            v11.setAvailable(true);
            v11.setVehicleNumber("ABC-008");
            vehicleRepository.save(v11);

            // ============ SPORTS CARS ============
            VehicleEntity v12 = new VehicleEntity();
            v12.setBrand("Ford");
            v12.setModel("Mustang");
            v12.setYear(2021);
            v12.setDailyRate(60.0);
            v12.setType("Sports");
            v12.setAvailable(true);
            v12.setVehicleNumber("MUS-001");
            vehicleRepository.save(v12);

            VehicleEntity v13 = new VehicleEntity();
            v13.setBrand("Chevrolet");
            v13.setModel("Camaro");
            v13.setYear(2020);
            v13.setDailyRate(65.0);
            v13.setType("Sports");
            v13.setAvailable(true);
            v13.setVehicleNumber("CHV-001");
            vehicleRepository.save(v13);

            VehicleEntity v14 = new VehicleEntity();
            v14.setBrand("BMW");
            v14.setModel("M440i");
            v14.setYear(2022);
            v14.setDailyRate(95.0);
            v14.setType("Sports");
            v14.setAvailable(true);
            v14.setVehicleNumber("BMW-002");
            vehicleRepository.save(v14);

            // ============ HATCHBACKS ============
            VehicleEntity v15 = new VehicleEntity();
            v15.setBrand("Hyundai");
            v15.setModel("i20");
            v15.setYear(2019);
            v15.setDailyRate(28.0);
            v15.setType("Hatchback");
            v15.setAvailable(true);
            v15.setVehicleNumber("HUN-001");
            vehicleRepository.save(v15);

            VehicleEntity v16 = new VehicleEntity();
            v16.setBrand("Maruti");
            v16.setModel("Swift");
            v16.setYear(2020);
            v16.setDailyRate(25.0);
            v16.setType("Hatchback");
            v16.setAvailable(true);
            v16.setVehicleNumber("MAR-001");
            vehicleRepository.save(v16);

            VehicleEntity v17 = new VehicleEntity();
            v17.setBrand("Honda");
            v17.setModel("Jazz");
            v17.setYear(2021);
            v17.setDailyRate(30.0);
            v17.setType("Hatchback");
            v17.setAvailable(true);
            v17.setVehicleNumber("HND-001");
            vehicleRepository.save(v17);

            // ============ TRUCKS ============
            VehicleEntity v18 = new VehicleEntity();
            v18.setBrand("Ford");
            v18.setModel("F-150");
            v18.setYear(2021);
            v18.setDailyRate(70.0);
            v18.setType("Truck");
            v18.setAvailable(true);
            v18.setVehicleNumber("TRK-001");
            vehicleRepository.save(v18);

            VehicleEntity v19 = new VehicleEntity();
            v19.setBrand("Chevrolet");
            v19.setModel("Silverado");
            v19.setYear(2020);
            v19.setDailyRate(68.0);
            v19.setType("Truck");
            v19.setAvailable(true);
            v19.setVehicleNumber("TRK-002");
            vehicleRepository.save(v19);

            // ============ VANS ============
            VehicleEntity v20 = new VehicleEntity();
            v20.setBrand("Toyota");
            v20.setModel("Hiace");
            v20.setYear(2019);
            v20.setDailyRate(55.0);
            v20.setType("Van");
            v20.setAvailable(true);
            v20.setVehicleNumber("VAN-001");
            vehicleRepository.save(v20);

            VehicleEntity v21 = new VehicleEntity();
            v21.setBrand("Mercedes");
            v21.setModel("Sprinter");
            v21.setYear(2021);
            v21.setDailyRate(65.0);
            v21.setType("Van");
            v21.setAvailable(true);
            v21.setVehicleNumber("VAN-002");
            vehicleRepository.save(v21);

            System.out.println("✓ Vehicles loaded: 21 vehicles");
        }

        System.out.println("\n═══════════════════════════════════════════");
        System.out.println("✅ Demo Data Loading Completed!");
        System.out.println("═══════════════════════════════════════════");
        System.out.println("\n📋 DEMO LOGIN CREDENTIALS:\n");
        System.out.println("👤 CUSTOMERS (8 total):");
        System.out.println("   Email: john@customer.com | Password: password123");
        System.out.println("   Email: jane@customer.com | Password: password123");
        System.out.println("   ... and 6 more (see database)");
        System.out.println("\n🚗 DRIVERS (6 total):");
        System.out.println("   Email: mike@driver.com | Password: password123 | License: Commercial");
        System.out.println("   Email: sarah@driver.com | Password: password123 | License: Standard");
        System.out.println("   ... and 4 more (see database)");
        System.out.println("\n👨‍💼 ADMINS (3 total):");
        System.out.println("   Email: admin@admin.com | Password: admin123 | Access: FULL_ACCESS");
        System.out.println("   Email: manager@admin.com | Password: admin123 | Access: LIMITED_ACCESS");
        System.out.println("   Email: supervisor@admin.com | Password: admin123 | Access: FULL_ACCESS");
        System.out.println("\n🚙 VEHICLES (21 total):");
        System.out.println("   Sedans: 5 vehicles ($32-$85/day)");
        System.out.println("   SUVs: 6 vehicles ($42-$80/day)");
        System.out.println("   Sports: 3 vehicles ($60-$95/day)");
        System.out.println("   Hatchbacks: 3 vehicles ($25-$30/day)");
        System.out.println("   Trucks: 2 vehicles ($68-$70/day)");
        System.out.println("   Vans: 2 vehicles ($55-$65/day)");
        System.out.println("\n═══════════════════════════════════════════\n");
    }
}


