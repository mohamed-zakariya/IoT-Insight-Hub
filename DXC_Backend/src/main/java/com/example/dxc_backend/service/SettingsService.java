package com.example.dxc_backend.service;

import com.example.dxc_backend.model.Settings;
import com.example.dxc_backend.model.User;
import com.example.dxc_backend.repository.SettingsRepository;
import com.example.dxc_backend.repository.UserRepository;
import com.example.dxc_backend.util.Range;
import com.example.dxc_backend.validation.SensorMetricValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SettingsService {

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Settings createSetting(String type, String metric,
                                  Float thresholdValue, String alertType) {



        // ✅ Validate sensor type
        if (!SensorMetricValidation.SENSOR_METRIC_MAP.containsKey(type)) {
            throw new IllegalArgumentException("Sensor type '" + type + "' is not recognized.");
        }

        // ✅ Validate alertType
        if (!alertType.equalsIgnoreCase("ABOVE") && !alertType.equalsIgnoreCase("BELOW")) {
            throw new IllegalArgumentException("AlertType must be 'ABOVE' or 'BELOW'");
        }

        // ✅ Validate metric
        Set<String> validMetrics = SensorMetricValidation.SENSOR_METRIC_MAP.get(type);
        if (!validMetrics.contains(metric)) {
            throw new IllegalArgumentException("Metric '" + metric + "' is not valid for sensor type '" + type + "'");
        }

        // ✅ Get the valid range for the given metric
        Range validRange = SensorMetricValidation.METRIC_VALID_RANGES.get(type).get(metric);
        if (validRange != null && !validRange.isValid(thresholdValue)) {
            // Include valid range in the exception message
            throw new IllegalArgumentException("Threshold value for metric '" + metric + "' is out of range. Valid range: "
                    + validRange.getMin() + " to " + validRange.getMax());
        }

        // Remove existing setting (if any)
        settingsRepository.findByTypeAndMetric(type, metric)
                .ifPresent(existing -> settingsRepository.deleteByTypeAndMetric(type, metric));

        // Create and save new setting
        Settings settings = new Settings();
        settings.setType(type);
        settings.setMetric(metric);
        settings.setThresholdValue(thresholdValue);
        settings.setAlertType(alertType);
        return settingsRepository.save(settings);
    }

    public List<Settings> getAllSettings() {
        return settingsRepository.findAll();
    }

    public List<Settings> getSettingsByType(String type) {
        return settingsRepository.findAllByType(type);
    }


}
