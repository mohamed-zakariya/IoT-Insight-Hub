package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.*;
import com.example.dxc_backend.model.*;
import com.example.dxc_backend.repository.*;
import com.example.dxc_backend.strategy.alert.SensorAlertHandler;
import com.example.dxc_backend.util.EmailTemplateUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    @Autowired
    private SettingsRepository settingsRepository;
    @Autowired
    private AlertRepository alertRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private UserRepository userRepository;

    private final List<SensorAlertHandler> handlers;



    public AlertService(List<SensorAlertHandler> handlers,
                        AlertRepository alertRepository,
                        SettingsRepository settingsRepository,
                        UserRepository userRepository,
                        EmailService emailService) {
        this.handlers = handlers;
        this.alertRepository = alertRepository;
        this.settingsRepository = settingsRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }


    public void checkAndTriggerAlerts() {
        List<Settings> allSettings = settingsRepository.findAll();

        for (Settings setting : allSettings) {
            SensorAlertHandler handler = handlers.stream()
                    .filter(h -> h.getSensorType() == setting.getType())
                    .findFirst()
                    .orElse(null);

            if (handler == null) {
                System.err.println("No handler found for sensor type: " + setting.getType());
                continue;
            }

            try {
                float latestValue = handler.getLatestMetricValue(setting.getMetric());

                boolean alertTriggered =
                        (setting.getAlertType() == AlertType.ABOVE && latestValue > setting.getThresholdValue()) ||
                                (setting.getAlertType() == AlertType.BELOW && latestValue < setting.getThresholdValue());

                if (alertTriggered) {
                    Alert alert = new Alert();
                    alert.setType(setting.getType());
                    alert.setMetric(setting.getMetric());
                    alert.setMetricValue(latestValue);
                    alert.setThresholdValue(setting.getThresholdValue());
                    alert.setAlertType(setting.getAlertType());
                    alert.setMessage(String.format(
                            "Alert: %s sensor for '%s' is %s threshold. Value = %.2f, Threshold = %.2f",
                            setting.getType(), setting.getMetric(),
                            setting.getAlertType().getDisplayText().toLowerCase(),
                            latestValue, setting.getThresholdValue()
                    ));
                    alertRepository.save(alert);

                    String htmlContent = EmailTemplateUtil.buildAlertHtml(
                            setting.getType(), setting.getMetric(), latestValue,
                            setting.getThresholdValue(), setting.getAlertType().getDisplayText()
                    );
                    List<String> emails = userRepository.findAllEmails();
                    emailService.sendAlertEmail(emails, "🚨 Sensor Alert Triggered", htmlContent);
                }
            } catch (Exception e) {
                System.err.println("Failed to process alert: " + e.getMessage());
            }
        }
    }

//    private float getTrafficMetricValue(TrafficSensorData data, TrafficSensor metric) {
//        switch (metric) {
//            case TRAFFIC_DENSITY:
//                return data.getTrafficDensity();
//            case AVG_SPEED:
//                return data.getAvgSpeed();
//            default:
//                return 0f;
//        }
//    }
//
//    private float getAirMetricValue(AirPollutionSensorData data, AirPollutionSensor metric) {
//        switch (metric) {
//            case CO:
//                return data.getCo();
//            case OZONE:
//                return data.getOzone();
//            case NO2:
//                return data.getNo2();
//            case SO2:
//                return data.getSo2();
//            default:
//                return 0f;
//        }
//    }
//
//    private float getStreetLightMetricValue(StreetLightSensorData data, StreetLightSensor metric) {
//        switch (metric) {
//            case BRIGHTNESS_LEVEL:
//                return data.getBrightnessLevel();
//            case POWER_CONSUMPTION:
//                return data.getPowerConsumption();
//            default:
//                return 0f;
//        }
//    }
}
