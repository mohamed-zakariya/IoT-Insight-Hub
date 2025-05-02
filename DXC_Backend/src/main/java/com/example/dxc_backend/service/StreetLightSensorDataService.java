package com.example.dxc_backend.service;

import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.repository.StreetLightSensorDataRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StreetLightSensorDataService {

    private final StreetLightSensorDataRepository repository;

    public StreetLightSensorDataService(StreetLightSensorDataRepository repository) {
        this.repository = repository;
    }

    public List<StreetLightSensorData> getAllSensorData() {
        return repository.findAll();
    }

    public Optional<StreetLightSensorData> getSensorDataById(UUID id) {
        return repository.findById(id);
    }

    public StreetLightSensorData saveSensorData(StreetLightSensorData data) {
        System.out.println("Saving Street Light Sensor Data:");
        System.out.println(data);
        return repository.save(data);
    }

    public void deleteSensorData(UUID id) {
        repository.deleteById(id);
    }


}
