package com.example.dxc_backend.service;

import com.example.dxc_backend.strategy.generator.SensorDataGenerator;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.repository.StreetLightSensorDataRepository;
import com.example.dxc_backend.service.base.BaseSensorDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;

@Service
public class StreetLightSensorDataService extends BaseSensorDataService<StreetLightSensorData, UUID> {

    private final Random random = new Random();
    @Autowired private SensorDataGenerator<StreetLightSensorData> streetLightSensorSensorDataGenerator;


    public StreetLightSensorDataService(StreetLightSensorDataRepository repository) {
        super(repository);
    }

    public StreetLightSensorData generateRandomStreetLightSensorData(){
        return  streetLightSensorSensorDataGenerator.generateRandomSensorData();
    }
}
