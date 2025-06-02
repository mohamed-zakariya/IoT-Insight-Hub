package com.example.dxc_backend.service.base;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public abstract class BaseSensorDataService<T, ID> {

    protected final JpaRepository<T, ID> repository;

    public BaseSensorDataService(JpaRepository<T, ID> repository) {
        this.repository = repository;
    }

    public List<T> getAllSensorData() {
        return repository.findAll();
    }

    public Optional<T> getSensorDataById(ID id) {
        return repository.findById(id);
    }

    public T saveSensorData(T data) {
        preprocessData(data); // Hook method
        return repository.save(data);
    }

    public boolean deleteSensorData(ID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    // Hook method for subclass-specific processing
    protected void preprocessData(T data) {
        // By default, do nothing. Override in subclass if needed.
    }

}
