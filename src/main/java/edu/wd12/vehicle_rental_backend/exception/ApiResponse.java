package edu.wd12.vehicle_rental_backend.exception;

/**
 * Generic API response wrapper used throughout controllers.
 */
public record ApiResponse<T>(boolean success, String message, T data) { }

