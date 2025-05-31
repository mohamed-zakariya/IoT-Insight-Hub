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

    @Scheduled(fixedRate = 300000)
    public void runSensorGenerationAndAlertCheck() {
        TrafficSensorData trafficData = trafficSensorDataService.generateRandomTrafficSensorData();
        trafficSensorDataController.createTrafficSensorData(trafficData);

        AirPollutionSensorData airData = airPollutionSensorDataService.generateRandomAirPollutionSensorData();
        airPollutionSensorDataController.createSensorData(airData);

        StreetLightSensorData streetLightData = streetLightSensorDataService.generateRandomStreetLightSensorData();
        streetLightSensorDataController.createSensorData(streetLightData);

        alertService.checkAndTriggerAlerts();  // Only called once after all data is posted
    }

}
