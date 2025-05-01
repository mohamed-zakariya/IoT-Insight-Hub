package com.example.dxc_backend.service;

import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.TrafficSensorDataRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Service
public class TrafficSensorDataService {

    private final TrafficSensorDataRepository repository;

    public TrafficSensorDataService(TrafficSensorDataRepository repository) {
        this.repository = repository;
    }

    public List<TrafficSensorData> getAllTrafficSensorData() {
        return repository.findAll();
    }

    public Optional<TrafficSensorData> getTrafficSensorDataById(UUID id) {
        return repository.findById(id);
    }

    public TrafficSensorData saveTrafficSensorData(TrafficSensorData data) {
        // Print each attribute of the TrafficSensorData object
        System.out.println("Saving Traffic Sensor Data: ");
        System.out.println("ID: " + data.getId());
        System.out.println("Location: " + data.getLocation());
        System.out.println("Timestamp: " + data.getTimestamp());
        System.out.println("Traffic Density: " + data.getTrafficDensity());
        System.out.println("Average Speed: " + data.getAvgSpeed());
        System.out.println("Congestion Level: " + data.getCongestionLevel());

        return repository.save(data);
    }

    public void deleteTrafficSensorData(UUID id) {
        repository.deleteById(id);
    }
}