package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.PollutionLevel;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.repository.AirPollutionSensorDataRepository;
import com.example.dxc_backend.sensor.SensorProcessor;
import com.example.dxc_backend.sensor.SensorProcessorFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
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
        SensorProcessor processor = SensorProcessorFactory.getProcessor(data);
        processor.processData();
        return repository.save(data);
    }


    public boolean deleteSensorData(UUID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true; // Indicate successful deletion
        }
        return false; // Indicate that the ID was not found
    }


    private final Random random = new Random();
    public AirPollutionSensorData generateRandomAirPollutionSensorData() {
        AirPollutionSensorData data = new AirPollutionSensorData();

        //data.setId(UUID.randomUUID()); //dont  Generate random UUID for the sensor data
        // Generate random location
        data.setLocation("Location-" + random.nextInt(100));

        data.setTimestamp(LocalDateTime.now());
        data.setCo(random.nextFloat() * 50);  //between 0 and 50 (ppm)
        data.setSo2(random.nextFloat() * 50);
        data.setNo2(random.nextFloat() * 50);
        data.setOzone(random.nextFloat() * 300);  // between 0 and 300
        PollutionLevel[] pollutionLevels = PollutionLevel.values();

        data.setPollutionLevel(pollutionLevels[random.nextInt(pollutionLevels.length)]);

        return data;
    }


}
