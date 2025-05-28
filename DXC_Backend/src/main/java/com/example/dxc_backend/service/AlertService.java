package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.*;
import com.example.dxc_backend.model.*;
import com.example.dxc_backend.repository.*;
import com.example.dxc_backend.util.EmailTemplateUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    @Autowired
    private SettingsRepository settingsRepository;
    @Autowired
    private TrafficSensorDataRepository trafficRepo;
    @Autowired
    private AirPollutionSensorDataRepository airRepo;
    @Autowired
    private StreetLightSensorDataRepository lightRepo;
    @Autowired
    private AlertRepository alertRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private UserRepository userRepository;

    public void checkAndTriggerAlerts() {
        List<Settings> allSettings = settingsRepository.findAll();

        for (Settings setting : allSettings) {
            SensorType sensorType = setting.getType();
            String metricStr = setting.getMetric();
            float threshold = setting.getThresholdValue();
            AlertType alertType = setting.getAlertType();

            float latestValue = 0f;

            try {
                switch (sensorType) {
                    case TRAFFIC:
                        TrafficSensor metricTraffic = TrafficSensor.valueOf(metricStr);
                        TrafficSensorData latestTraffic = trafficRepo.findTopByOrderByTimestampDesc()
                                .orElseThrow(() -> new IllegalStateException("No traffic data available"));
                        latestValue = getTrafficMetricValue(latestTraffic, metricTraffic);
                        break;

                    case AIR_POLLUTION:
                        AirPollutionSensor metricAir = AirPollutionSensor.valueOf(metricStr);
                        AirPollutionSensorData latestAir = airRepo.findTopByOrderByTimestampDesc()
                                .orElseThrow(() -> new IllegalStateException("No Air Pollution data available"));
                        latestValue = getAirMetricValue(latestAir, metricAir);
                        break;

                    case STREET_LIGHT:
                        StreetLightSensor metricLight = StreetLightSensor.valueOf(metricStr);
                        StreetLightSensorData latestLight = lightRepo.findTopByOrderByTimestampDesc()
                                .orElseThrow(() -> new IllegalStateException("No Street Light data available"));
                        latestValue = getStreetLightMetricValue(latestLight, metricLight);
                        break;

                    default:
                        // Optionally log unknown sensor type
                        continue;
                }
            } catch (IllegalArgumentException e) {
                // metricStr not matching enum value
                System.err.println("Invalid metric '" + metricStr + "' for sensor type " + sensorType);
                continue; // skip this setting
            } catch (IllegalStateException e) {
                // No sensor data available
                System.err.println(e.getMessage());
                continue; // skip this setting
            }

            boolean alertTriggered =
                    (alertType == AlertType.ABOVE && latestValue > threshold) ||
                            (alertType == AlertType.BELOW && latestValue < threshold);

            if (alertTriggered) {
                Alert alert = new Alert();
                alert.setType(sensorType);
                alert.setMetric(metricStr);  // store metric as String
                alert.setMetricValue(latestValue);
                alert.setThresholdValue(threshold);
                alert.setAlertType(alertType);
                alert.setMessage(String.format(
                        "Alert: %s sensor for '%s' is %s threshold. Value = %.2f, Threshold = %.2f",
                        sensorType, metricStr, alertType.getDisplayText().toLowerCase(), latestValue, threshold
                ));
                alertRepository.save(alert);

                String htmlContent = EmailTemplateUtil.buildAlertHtml(
                        sensorType, metricStr, latestValue, threshold, alertType.getDisplayText()
                );

                List<String> emails = userRepository.findAllEmails();

                try {
                    emailService.sendAlertEmail(emails, "🚨 Sensor Alert Triggered", htmlContent);
                } catch (Exception e) {
                    System.err.println("Failed to send alert email: " + e.getMessage());
                }
            }
        }
    }

    private float getTrafficMetricValue(TrafficSensorData data, TrafficSensor metric) {
        switch (metric) {
            case TRAFFIC_DENSITY:
                return data.getTrafficDensity();
            case AVG_SPEED:
                return data.getAvgSpeed();
            default:
                return 0f;
        }
    }

    private float getAirMetricValue(AirPollutionSensorData data, AirPollutionSensor metric) {
        switch (metric) {
            case CO:
                return data.getCo();
            case OZONE:
                return data.getOzone();
            case NO2:
                return data.getNo2();
            case SO2:
                return data.getSo2();
            default:
                return 0f;
        }
    }

    private float getStreetLightMetricValue(StreetLightSensorData data, StreetLightSensor metric) {
        switch (metric) {
            case BRIGHTNESS_LEVEL:
                return data.getBrightnessLevel();
            case POWER_CONSUMPTION:
                return data.getPowerConsumption();
            default:
                return 0f;
        }
    }
}
