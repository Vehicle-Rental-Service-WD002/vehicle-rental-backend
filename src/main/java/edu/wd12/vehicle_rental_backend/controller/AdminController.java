package edu.wd12.vehicle_rental_backend.controller;

import edu.wd12.vehicle_rental_backend.dto.AdminDto;
import edu.wd12.vehicle_rental_backend.entity.AdminEntity;
import edu.wd12.vehicle_rental_backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/admins")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // CREATE (POST /api/admins)
    @PostMapping
    public ResponseEntity<AdminEntity> createAdmin(@RequestBody AdminDto dto) {
        return new ResponseEntity<>(adminService.createAdmin(dto), HttpStatus.CREATED);
    }

    // READ ALL (GET /api/admins)
    @GetMapping
    public ResponseEntity<List<AdminEntity>> getAllAdmins() {
        return new ResponseEntity<>(adminService.getAllAdmins(), HttpStatus.OK);
    }

    // READ ONE (GET /api/admins/{id})
    @GetMapping("/{id}")
    public ResponseEntity<AdminEntity> getAdminById(@PathVariable Long id) {
        return new ResponseEntity<>(adminService.getAdminById(id), HttpStatus.OK);
    }

    // UPDATE (PUT /api/admins/{id})
    @PutMapping("/{id}")
    public ResponseEntity<AdminEntity> updateCustomer(@PathVariable long id, @RequestBody AdminDto dto) {
        return new ResponseEntity<>(adminService.updateAdmin(id, dto), HttpStatus.OK);
    }

    // DELETE (DELETE /api/admins/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return new ResponseEntity<>("Admin deleted successfully!", HttpStatus.OK);
    }
}
