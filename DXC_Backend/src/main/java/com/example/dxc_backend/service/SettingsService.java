package com.example.dxc_backend.service;

import com.example.dxc_backend.enums.AlertType;
import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.Settings;
import com.example.dxc_backend.repository.SettingsRepository;
import com.example.dxc_backend.repository.UserRepository;
import com.example.dxc_backend.util.Range;
import com.example.dxc_backend.validation.SensorMetricValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class SettingsService {

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Settings createSetting(SensorType sensorType, String metric,
                                  Float thresholdValue, AlertType alertType) {
        // ✅ Validate sensor type
        if (sensorType == null || !SensorMetricValidation.SENSOR_METRIC_MAP.containsKey(sensorType)) {
            throw new IllegalArgumentException("Sensor type '" + sensorType + "' is not recognized.");
        }

        // ✅ Validate metric
        Set<String> validMetrics = SensorMetricValidation.SENSOR_METRIC_MAP.get(sensorType);
        if (validMetrics == null || !validMetrics.contains(metric)) {
            throw new IllegalArgumentException("Metric '" + metric + "' is not valid for sensor type '" + sensorType + "'");
        }

        // ✅ Get the valid range for the given metric
        Map<String, Range> metricRangeMap = SensorMetricValidation.METRIC_VALID_RANGES.get(sensorType);
        if (metricRangeMap != null) {
            Range validRange = metricRangeMap.get(metric);
            if (validRange != null && !validRange.isValid(thresholdValue)) {
                throw new IllegalArgumentException("Threshold value for metric '" + metric + "' is out of range. Valid range: "
                        + validRange.getMin() + " to " + validRange.getMax());
            }
        }

        // Remove existing setting (if any)
        settingsRepository.findByTypeAndMetric(sensorType.name(), metric)
                .ifPresent(existing -> settingsRepository.deleteByTypeAndMetric(sensorType.name(), metric));

        // Create and save new setting
        Settings settings = new Settings();
        settings.setType(sensorType);
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
