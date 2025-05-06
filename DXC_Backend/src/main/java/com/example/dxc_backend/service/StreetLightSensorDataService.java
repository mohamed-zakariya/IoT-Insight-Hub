package com.example.dxc_backend.service;

import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.model.TrafficSensorData;
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



    //now will make a a new function for the random generation
    private final Random random = new Random();

    public StreetLightSensorData generateRandomStreetLightSensorData() {
        StreetLightSensorData data = new StreetLightSensorData();
        //data.setId(UUID.randomUUID()); we generate the uuid from the call dont forget because we cant send it in the random // be well ^_~^_~^_~^_~^_~
        data.setLocation("Location-" + random.nextInt(100)); //  Location-1, Location-2
        data.setTimestamp(LocalDateTime.now());
        data.setBrightnessLevel(random.nextInt(101)); // from 0 and 100
        data.setPowerConsumption(random.nextFloat() * 5000); // from 0 and 5000
        data.setStatus(new String[]{"ON", "OFF"}[random.nextInt(2)]);
        return data;
    }


}
