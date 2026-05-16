package edu.wd12.vehicle_rental_backend.service.impl;

import edu.wd12.vehicle_rental_backend.dto.CustomerDto;
import edu.wd12.vehicle_rental_backend.entity.CustomerEntity;
import edu.wd12.vehicle_rental_backend.exception.DuplicateResourceException;
import edu.wd12.vehicle_rental_backend.exception.ResourceNotFoundException;
import edu.wd12.vehicle_rental_backend.repository.CustomerRepository;
import edu.wd12.vehicle_rental_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import edu.wd12.vehicle_rental_backend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {


    final CustomerRepository customerRepository;
    final UserRepository userRepository;
    final PasswordEncoder passwordEncoder;

    @Override
    public CustomerEntity createCustomer(CustomerDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email is already in use");
        }

        CustomerEntity customer = new CustomerEntity();
        customer.setUsername(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPassword(passwordEncoder.encode(dto.getPassword()));
        customer.setPhoneNumber(dto.getPhoneNumber());
        customer.setNationalId(dto.getNationalId());

        return customerRepository.save(customer);
    }

    @Override
    public List<CustomerEntity> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Override
    public CustomerEntity getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    @Override
    public CustomerEntity updateCustomer(Long id, CustomerDto dto) {
        CustomerEntity existingCustomer = getCustomerById(id);

        userRepository.findByEmail(dto.getEmail())
                .filter(user -> !user.getId().equals(id))
                .ifPresent(user -> {
                    throw new DuplicateResourceException("Email is already in use");
                });

        existingCustomer.setUsername(dto.getName());
        existingCustomer.setEmail(dto.getEmail());
        existingCustomer.setPassword(passwordEncoder.encode(dto.getPassword()));
        existingCustomer.setPhoneNumber(dto.getPhoneNumber());
        existingCustomer.setNationalId(dto.getNationalId());

        return customerRepository.save(existingCustomer);
    }

    @Override
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        CustomerEntity existingCustomer = getCustomerById(id);
        customerRepository.delete(existingCustomer);

    }
}