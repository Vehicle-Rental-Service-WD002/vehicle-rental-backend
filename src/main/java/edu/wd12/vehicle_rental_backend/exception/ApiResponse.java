package edu.wd12.vehicle_rental_backend.exception;

public record ApiResponse<T>(boolean success, String message, T data) { }

