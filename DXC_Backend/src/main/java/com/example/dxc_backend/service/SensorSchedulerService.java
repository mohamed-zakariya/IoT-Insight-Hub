package com.example.dxc_backend.service;

import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.controller.TrafficSensorDataController;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class SensorSchedulerService {

    private final TrafficSensorDataService trafficSensorDataService;
    private final TrafficSensorDataController TrafficSensorDataController;

    public SensorSchedulerService(TrafficSensorDataService trafficSensorDataService, TrafficSensorDataController TrafficSensorDataController) {
        this.trafficSensorDataService = trafficSensorDataService;
        this.TrafficSensorDataController = TrafficSensorDataController;
    }

    @Scheduled(fixedRate = 10000) // Runs every 5 minutes (300,000 ms)
    public void generateAndPostTrafficSensorData() {
        TrafficSensorData randomData = trafficSensorDataService.generateRandomTrafficSensorData();
        System.out.println("Generated Traffic Sensor Data: " + randomData.toString());
        TrafficSensorDataController.createTrafficSensorData(randomData); // Call the POST function
    }
}
