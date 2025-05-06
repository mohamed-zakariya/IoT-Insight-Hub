package com.example.dxc_backend.service;

import com.example.dxc_backend.controller.AirPollutionSensorDataController;
import com.example.dxc_backend.controller.StreetLightSensorDataController;
import com.example.dxc_backend.controller.TrafficSensorDataController;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.model.TrafficSensorData;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class SensorSchedulerService {

    private final TrafficSensorDataService trafficSensorDataService;
    private final TrafficSensorDataController trafficSensorDataController;

    private final AirPollutionSensorDataService airPollutionSensorDataService;
    private final AirPollutionSensorDataController airPollutionSensorDataController;

    private final StreetLightSensorDataService streetLightSensorDataService;
    private final StreetLightSensorDataController streetLightSensorDataController;



    // Constructor to inject the dependencies for both traffic and air pollution services/controllers
    public SensorSchedulerService(TrafficSensorDataService trafficSensorDataService,
                                  TrafficSensorDataController trafficSensorDataController,
                                  AirPollutionSensorDataService airPollutionSensorDataService,
                                  AirPollutionSensorDataController airPollutionSensorDataController,
                                  StreetLightSensorDataService streetLightSensorDataService,
                                  StreetLightSensorDataController streetLightSensorDataController  ) {
        this.trafficSensorDataService = trafficSensorDataService;
        this.trafficSensorDataController = trafficSensorDataController;
        this.airPollutionSensorDataService = airPollutionSensorDataService;
        this.airPollutionSensorDataController = airPollutionSensorDataController;
        this.streetLightSensorDataService = streetLightSensorDataService;
        this.streetLightSensorDataController = streetLightSensorDataController;
    }

    @Scheduled(fixedRate = 300000) // Runs every 5 minutes (300,000 ms)
    public void generateAndPostTrafficSensorData() {
        TrafficSensorData randomData = trafficSensorDataService.generateRandomTrafficSensorData();
        System.out.println("Generated Traffic Sensor Data: " + randomData.toString());
        trafficSensorDataController.createTrafficSensorData(randomData); // Call the POST function
    }

    @Scheduled(fixedRate = 300000) // Runs every 5 minutes (300,000 ms)
    public void generateAndPostAirPollutionSensorData() {
        AirPollutionSensorData randomData = airPollutionSensorDataService.generateRandomAirPollutionSensorData();
        System.out.println("Generated Air Pollution Sensor Data: " + randomData.toString());
        airPollutionSensorDataController.createSensorData(randomData); // Call the POST function
    }

    @Scheduled(fixedRate = 300000) // Runs every 5 minutes (300,000 ms)
    public void generateAndPostStreetLightSensorData() {
        StreetLightSensorData randomData = streetLightSensorDataService.generateRandomStreetLightSensorData();
        System.out.println("Generated Traffic Sensor Data: " + randomData.toString());
        streetLightSensorDataController.createSensorData(randomData); // Call the POST function
    }



}
