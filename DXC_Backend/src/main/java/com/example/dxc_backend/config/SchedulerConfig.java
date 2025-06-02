package com.example.dxc_backend.config;

import com.example.dxc_backend.controller.AirPollutionSensorDataController;
import com.example.dxc_backend.controller.StreetLightSensorDataController;
import com.example.dxc_backend.controller.TrafficSensorDataController;
import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SchedulerConfig {
//
//    private final SensorDataUnifiedService sensorDataService;
//    private final AlertService alertService;
//
//    public SchedulerConfig(SensorDataUnifiedService sensorDataService, AlertService alertService) {
//        this.sensorDataService = sensorDataService;
//        this.alertService = alertService;
//    }
//
//    @Scheduled(fixedRate = 300000) // Every 5 minutes
//    public void runSensorGenerationAndAlertCheck() {
//        for (SensorType type : SensorType.values()) {
//            sensorDataService.generateAndSave(type);
//        }
//
//        alertService.checkAndTriggerAlerts(); // Run once after all types
//    }
}
