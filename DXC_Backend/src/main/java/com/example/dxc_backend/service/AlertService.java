package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.*;
import com.example.dxc_backend.model.*;
import com.example.dxc_backend.repository.*;
import com.example.dxc_backend.strategy.alert.SensorAlertHandler;
import com.example.dxc_backend.util.EmailTemplateUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    private static final Logger logger = LoggerFactory.getLogger(AlertService.class);

    private final SettingsRepository settingsRepository;
    private final AlertRepository alertRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
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
                logger.warn("No handler found for sensor type: {}", setting.getType());
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
                logger.error("Failed to process alert for setting {}: {}", setting.getId(), e.getMessage(), e);
            }
        }
    }
}
