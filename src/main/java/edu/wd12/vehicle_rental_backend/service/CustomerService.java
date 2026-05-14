package edu.wd12.vehicle_rental_backend.service;

import edu.wd12.vehicle_rental_backend.dto.CustomerDto;
import edu.wd12.vehicle_rental_backend.entity.CustomerEntity;

import java.util.List;

public interface CustomerService {

    String createCustomer(CustomerDto dto);
    List<CustomerEntity> getAllCustomers();
    CustomerEntity getCustomerById(Long id);
    CustomerEntity updateCustomer(Long id, CustomerDto dto);
    void deleteCustomer(Long id);
}
