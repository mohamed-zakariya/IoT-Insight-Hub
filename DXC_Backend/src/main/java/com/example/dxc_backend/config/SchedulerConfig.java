package com.example.dxc_backend.config;

import com.example.dxc_backend.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@EnableScheduling
@Configuration
public class SchedulerConfig {

    @Autowired
    private AlertService alertService;

    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void runAlertCheck() {
        alertService.checkAndTriggerAlerts();
    }
}
