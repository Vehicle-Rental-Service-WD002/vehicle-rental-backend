package edu.wd12.vehicle_rental_backend.model;

public abstract class User {
    private String userId;
    private String name;
    private String email;
    private String password;

    public User(String userId, String name, String email, String password) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password,String email) {
        this.password = password;
    }

    public boolean login(String inputEmail, String inputPassword){
        if (this.email.equals(inputEmail) && this.password.equals(inputPassword)) {
            return true;
        } else{
            System.out.println("Login failed: Invalid email or password.");
            return false;
        }
    }

    public abstract void registerUser();
    public abstract String viewProfile();
    public abstract void updateProfile();
    public abstract void deleteProfile();

}
