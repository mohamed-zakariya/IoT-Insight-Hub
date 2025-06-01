package com.example.dxc_backend.service;

import com.example.dxc_backend.strategy.generator.SensorDataGenerator;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.repository.AirPollutionSensorDataRepository;
import com.example.dxc_backend.service.base.BaseSensorDataService;
import com.example.dxc_backend.factory.processor.SensorProcessor;
import com.example.dxc_backend.factory.SensorProcessorFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;

@Service
public class AirPollutionSensorDataService extends BaseSensorDataService<AirPollutionSensorData, UUID> {

    private final Random random = new Random();
    @Autowired private SensorDataGenerator<AirPollutionSensorData> airPollutionSensorDataGenerator;

    public AirPollutionSensorDataService(JpaRepository<AirPollutionSensorData, UUID> repository) {
        super(repository);
    }

    @Override
    protected void preprocessData(AirPollutionSensorData data) {
        SensorProcessor processor = SensorProcessorFactory.getProcessor(data);
        processor.processData();
    }

    public AirPollutionSensorData generateRandomAirPollutionSensorData() {
        return airPollutionSensorDataGenerator.generateRandomSensorData();
    }




}

