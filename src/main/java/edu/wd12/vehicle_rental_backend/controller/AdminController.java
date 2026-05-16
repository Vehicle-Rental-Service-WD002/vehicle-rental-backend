package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.AdminDto;
import edu.wd12.vehicle_rental_backend.entity.AdminEntity;
import edu.wd12.vehicle_rental_backend.exception.ApiResponse;
import edu.wd12.vehicle_rental_backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/admins")
@RequiredArgsConstructor
@CrossOrigin
public class AdminController {

    private final AdminService adminService;

    @PostMapping
    public ResponseEntity<ApiResponse<AdminEntity>> createAdmin(@Valid @RequestBody AdminDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Admin created successfully",
                        adminService.createAdmin(dto)
                ));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminEntity>>> getAllAdmins() {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>(true,
                        "Admins retrieved successfully",
                        adminService.getAllAdmins()
                ));
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminEntity>> getAdminById(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>(
                        true,
                        "Admin retrieved successfully",
                        adminService.getAdminById(id)
                ));
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminEntity>> updateAdmin(@PathVariable long id, @Valid @RequestBody AdminDto dto) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>(
                        true,
                        "Admin updated successfully",
                        adminService.updateAdmin(id, dto)
                ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse<>(
                        true,
                        "Admin deleted successfully",
                        null

                ));
    }
}
