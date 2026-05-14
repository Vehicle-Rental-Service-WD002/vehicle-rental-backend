package edu.wd12.vehicle_rental_backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.wd12.vehicle_rental_backend.dto.CustomerDto;
import edu.wd12.vehicle_rental_backend.entity.CustomerEntity;
import edu.wd12.vehicle_rental_backend.repository.CustomerRepository;
import edu.wd12.vehicle_rental_backend.repository.UserRepository;
import edu.wd12.vehicle_rental_backend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {


    final CustomerRepository customerRepository;
    final UserRepository userRepository;

    @Override
    public String createCustomer(CustomerDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        CustomerEntity customer = new CustomerEntity();
        customer.setUsername(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPassword(dto.getPassword());
        customer.setPhoneNumber(dto.getPhoneNumber());
        customer.setNationalId(dto.getNationalId());

        customerRepository.save(customer);
        return "Customer created successfully";
    }

    @Override
    public List<CustomerEntity> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Override
    public CustomerEntity getCustomerById(Long id) {

        return new ObjectMapper().convertValue(customerRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Error: Customer not found!"))
                , CustomerEntity.class);

    }

    @Override
    public CustomerEntity updateCustomer(Long id, CustomerDto dto) {
        CustomerEntity existingCustomer = getCustomerById(id);

        existingCustomer.setUsername(dto.getName());
        existingCustomer.setNationalId(dto.getNationalId());

        return customerRepository.save(existingCustomer);
    }

    @Override
    public void deleteCustomer(Long id) {
        CustomerEntity existingCustomer = getCustomerById(id);
        customerRepository.delete(existingCustomer);

    }
}