package edu.wd12.vehicle_rental_backend.model;

public class Booking {
    private String bookingId;
    private String startDate;
    private String endDate;
    private String actualReturnDate;
    private String status;

    public Booking(String bookingId, String startDate, String endDate, String actualReturnDate, String status) {
        this.bookingId = bookingId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.actualReturnDate = actualReturnDate;
        this.status = status;
    }


}
