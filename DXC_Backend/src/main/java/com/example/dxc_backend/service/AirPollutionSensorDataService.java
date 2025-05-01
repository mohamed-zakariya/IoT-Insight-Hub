package com.example.dxc_backend.service;

import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.repository.AirPollutionSensorDataRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AirPollutionSensorDataService {

    private final AirPollutionSensorDataRepository repository;

    public AirPollutionSensorDataService(AirPollutionSensorDataRepository repository) {
        this.repository = repository;
    }

    public List<AirPollutionSensorData> getAllSensorData() {
        return repository.findAll();
    }

    public Optional<AirPollutionSensorData> getSensorDataById(UUID id) {
        return repository.findById(id);
    }

    public AirPollutionSensorData saveSensorData(AirPollutionSensorData data) {
        System.out.println("Saving Air Pollution Sensor Data:");
        System.out.println(data);
        return repository.save(data);
    }

    public void deleteSensorData(UUID id) {
        repository.deleteById(id);
    }
}
