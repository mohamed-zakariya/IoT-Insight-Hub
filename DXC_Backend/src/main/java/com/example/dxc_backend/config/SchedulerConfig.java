package com.example.dxc_backend.config;

import com.example.dxc_backend.controller.AirPollutionSensorDataController;
import com.example.dxc_backend.controller.StreetLightSensorDataController;
import com.example.dxc_backend.controller.TrafficSensorDataController;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.service.AlertService;
import com.example.dxc_backend.service.AirPollutionSensorDataService;
import com.example.dxc_backend.service.StreetLightSensorDataService;
import com.example.dxc_backend.service.TrafficSensorDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    @Autowired
    private TrafficSensorDataService trafficSensorDataService;

    @Autowired
    private TrafficSensorDataController trafficSensorDataController;

    @Autowired
    private AirPollutionSensorDataService airPollutionSensorDataService;

    @Autowired
    private AirPollutionSensorDataController airPollutionSensorDataController;

    @Autowired
    private StreetLightSensorDataService streetLightSensorDataService;

    @Autowired
    private StreetLightSensorDataController streetLightSensorDataController;

    @Autowired
    private AlertService alertService;

    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void generateAndPostTrafficSensorData() {
        TrafficSensorData randomData = trafficSensorDataService.generateRandomTrafficSensorData();
        System.out.println("Generated Traffic Sensor Data: " + randomData);
        trafficSensorDataController.createTrafficSensorData(randomData);
        alertService.checkAndTriggerAlerts(); // ✅ ensure alert runs after latest data is posted
    }

    @Scheduled(fixedRate = 300000)
    public void generateAndPostAirPollutionSensorData() {
        AirPollutionSensorData randomData = airPollutionSensorDataService.generateRandomAirPollutionSensorData();
        System.out.println("Generated Air Pollution Sensor Data: " + randomData);
        airPollutionSensorDataController.createSensorData(randomData);
    }

    @Scheduled(fixedRate = 300000)
    public void generateAndPostStreetLightSensorData() {
        StreetLightSensorData randomData = streetLightSensorDataService.generateRandomStreetLightSensorData();
        System.out.println("Generated Street Light Sensor Data: " + randomData);
        streetLightSensorDataController.createSensorData(randomData);
    }
}
