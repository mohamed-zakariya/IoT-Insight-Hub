package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.Status;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.repository.StreetLightSensorDataRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class StreetLightSensorDataService {

    private final StreetLightSensorDataRepository repository;
    private final Random random = new Random();

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

    public boolean deleteSensorData(UUID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true; // Indicate successful deletion
        }
        return false; // Indicate that the ID was not found
    }

    public StreetLightSensorData generateRandomStreetLightSensorData() {
        StreetLightSensorData data = new StreetLightSensorData();

        // UUID generation should be done externally or by the database
        // data.setId(UUID.randomUUID()); // Uncomment if needed here

        data.setLocation("Location-" + random.nextInt(100)); // Location-0 to Location-99
        data.setTimestamp(LocalDateTime.now());
        data.setBrightnessLevel(random.nextInt(101)); // 0 to 100 inclusive
        data.setPowerConsumption(random.nextFloat() * 5000); // 0 to 5000

        // Correctly assign Status enum randomly
        Status[] statuses = Status.values();
        data.setStatus(statuses[random.nextInt(statuses.length)]);

        return data;
    }
}
