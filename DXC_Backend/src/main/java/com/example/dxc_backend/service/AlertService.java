package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.AlertType;
import com.example.dxc_backend.enums.SensorType;
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
    @Autowired private TrafficSensorDataRepository trafficRepo;
    @Autowired private AirPollutionSensorDataRepository airRepo;
    @Autowired private StreetLightSensorDataRepository lightRepo;
    @Autowired private AlertRepository alertRepository;
    @Autowired private EmailService emailService;
    @Autowired private UserRepository userRepository; // assuming it exists


    public void checkAndTriggerAlerts() {
        List<Settings> allSettings = settingsRepository.findAll();

        for (Settings setting : allSettings) {
            SensorType sensorType = setting.getType();
            String metric = setting.getMetric();
            float threshold = setting.getThresholdValue();
            AlertType alertType = setting.getAlertType();

            float latestValue = 0f;

            // Get the latest metric value based on sensor type
            switch (sensorType) {
                case TRAFFIC:
                    TrafficSensorData latestTraffic = trafficRepo.findTopByOrderByTimestampDesc()
                            .orElseThrow(() -> new IllegalStateException("No traffic data available"));
                    latestValue = getTrafficMetricValue(latestTraffic, metric);
                    break;

                case AIR_POLLUTION:
                    AirPollutionSensorData latestAir = airRepo.findTopByOrderByTimestampDesc()
                            .orElseThrow(() -> new IllegalStateException("No Air Poll data available"));
                    latestValue = getAirMetricValue(latestAir, metric);
                    break;

                case STREET_LIGHT:
                    StreetLightSensorData latestLight = lightRepo.findTopByOrderByTimestampDesc()
                            .orElseThrow(() -> new IllegalStateException("No Street Light data available"));
                    latestValue = getStreetLightMetricValue(latestLight, metric);
                    break;
            }

            boolean alertTriggered =
                    (alertType == AlertType.ABOVE && latestValue > threshold) ||
                            (alertType == AlertType.BELOW && latestValue < threshold);

            if (alertTriggered) {
                Alert alert = new Alert();
                alert.setType(sensorType);
                alert.setMetric(metric);
                alert.setMetricValue(latestValue);
                alert.setThresholdValue(threshold);
                alert.setAlertType(alertType);
                alert.setMessage(String.format(
                        "Alert: %s sensor for '%s' is %s threshold. Value = %.2f, Threshold = %.2f",
                        sensorType, metric, alertType.getDisplayText().toLowerCase(), latestValue, threshold
                ));
                alertRepository.save(alert);

                String htmlContent = EmailTemplateUtil.buildAlertHtml(
                        sensorType, metric, latestValue, threshold, alertType.getDisplayText()
                );

                // ⬇️ Get all user emails (you need a method for this in your repository)
                List<String> emails = userRepository.findAllEmails(); // or hardcode for now

                // ⬇️ Send the email
                try {
                    emailService.sendAlertEmail(emails, "🚨 Sensor Alert Triggered", htmlContent);
                } catch (Exception e) {
                    System.err.println("Failed to send alert email: " + e.getMessage());    // TODO: replace
                }
            }

        }
    }

    private float getTrafficMetricValue(TrafficSensorData data, String metric) {
        switch (metric) {
            case "trafficDensity": return data.getTrafficDensity();
            case "avgSpeed": return data.getAvgSpeed();
            default: return 0;
        }
    }

    private float getAirMetricValue(AirPollutionSensorData data, String metric) {
        switch (metric) {
            case "co": return data.getCo();
            case "ozone": return data.getOzone();
            case "no2": return data.getNo2();
            case "so2": return data.getSo2();
            default: return 0;
        }
    }

    private float getStreetLightMetricValue(StreetLightSensorData data, String metric) {
        switch (metric) {
            case "brightnessLevel": return data.getBrightnessLevel();
            case "powerConsumption": return data.getPowerConsumption();
            default: return 0;
        }
    }
}
