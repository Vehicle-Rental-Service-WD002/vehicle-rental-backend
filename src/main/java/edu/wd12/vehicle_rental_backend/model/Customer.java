package edu.wd12.vehicle_rental_backend.model;

public class Customer extends User {
    private String licenceNumber;

    public Customer(String userId, String name, String email, String password, String licenceNumber) {
        super(userId, name, email, password);
        this.licenceNumber = licenceNumber;
    }

    @Override
    public void registerUser() {
        // Implement registration logic here
    }

    @Override
    public String viewProfile() {
        // Implement profile viewing logic here
        return null;
    }

    @Override
    public void updateProfile() {
        // Implement profile updating logic here
    }

    @Override
    public void deleteProfile() {
        // Implement profile deletion logic here
    }

    public void updateLicenceNumber(String newLicenceNumber) {
        this.licenceNumber = newLicenceNumber;
    }

}
