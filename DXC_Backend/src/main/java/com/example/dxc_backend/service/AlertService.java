package com.example.dxc_backend.service;

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

        System.out.println("zakariaaaaaaaaaaaaaaaaaa" + allSettings);
        for (Settings setting : allSettings) {
            String type = setting.getType();
            String metric = setting.getMetric();
            float threshold = setting.getThresholdValue();
            String alertType = setting.getAlertType();

            float latestValue = 0f;

            // Get the latest metric value based on sensor type
            switch (type) {
                case "Traffic":
                    TrafficSensorData latestTraffic = trafficRepo.findTopByOrderByTimestampDesc()
                            .orElseThrow(() -> new IllegalStateException("No traffic data available"));
                    latestValue = getTrafficMetricValue(latestTraffic, metric);
                    break;

                case "Air_Pollution":
                    AirPollutionSensorData latestAir = airRepo.findTopByOrderByTimestampDesc()
                            .orElseThrow(() -> new IllegalStateException("No Air Poll data available"));
                    latestValue = getAirMetricValue(latestAir, metric);
                    break;

                case "Street_Light":
                    StreetLightSensorData latestLight = lightRepo.findTopByOrderByTimestampDesc()
                            .orElseThrow(() -> new IllegalStateException("No Street Light data available"));
                    latestValue = getStreetLightMetricValue(latestLight, metric);
                    break;
            }

            boolean alertTriggered =
                    ("ABOVE".equals(alertType) && latestValue > threshold) ||
                            ("BELOW".equals(alertType) && latestValue < threshold);

            if (alertTriggered) {
                Alert alert = new Alert();
                alert.setType(type);
                alert.setMetric(metric);
                alert.setMetricValue(latestValue);
                alert.setThresholdValue(threshold);
                alert.setAlertType(alertType);
                alert.setMessage(String.format(
                        "Alert: %s sensor for '%s' is %s threshold. Value = %.2f, Threshold = %.2f",
                        type, metric, alertType.equals("ABOVE") ? "above" : "below", latestValue, threshold
                ));
                alertRepository.save(alert);

                // ⬇️ Build email content
                String htmlContent = EmailTemplateUtil.buildAlertHtml(
                        type, metric, latestValue, threshold,
                        alertType.equals("ABOVE") ? "Above" : "Below"
                );

                // ⬇️ Get all user emails (you need a method for this in your repository)
                List<String> emails = userRepository.findAllEmails(); // or hardcode for now

                // ⬇️ Send the email
                try {
                    emailService.sendAlertEmail(emails, "🚨 Sensor Alert Triggered", htmlContent);
                } catch (Exception e) {
                    System.err.println("Failed to send alert email: " + e.getMessage());
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
