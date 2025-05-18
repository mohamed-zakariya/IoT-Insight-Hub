package com.example.dxc_backend.service;

import com.example.dxc_backend.model.Settings;
import com.example.dxc_backend.repository.SettingsRepository;
import com.example.dxc_backend.util.Range;
import com.example.dxc_backend.validation.SensorMetricValidation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SettingsServiceTest {

    @Mock
    private SettingsRepository settingsRepository;

    @InjectMocks
    private SettingsService settingsService;

    @BeforeEach
    void setupValidation() {
        Set<String> trafficMetrics = new HashSet<>();
        trafficMetrics.add("avgSpeed");

        Map<String, Set<String>> sensorMap = new HashMap<>();
        sensorMap.put("Traffic", trafficMetrics);

        Map<String, Range> metricRange = new HashMap<>();
        metricRange.put("avgSpeed", new Range(0f, 120f));

        Map<String, Map<String, Range>> rangesMap = new HashMap<>();
        rangesMap.put("Traffic", metricRange);

        SensorMetricValidation.SENSOR_METRIC_MAP = sensorMap;
        SensorMetricValidation.METRIC_VALID_RANGES = rangesMap;
    }

    @Test
    public void testCreateSetting_Success() {
        String sensorType = "Traffic";
        String metric = "avgSpeed";
        Float threshold = 100f;
        String alertType = "BELOW";

        when(settingsRepository.findByTypeAndMetric(sensorType, metric)).thenReturn(Optional.empty());
        when(settingsRepository.save(any(Settings.class))).thenAnswer(inv -> inv.getArgument(0));

        Settings result = settingsService.createSetting(sensorType, metric, threshold, alertType);

        assertEquals(sensorType, result.getType());
        assertEquals(metric, result.getMetric());
        assertEquals(threshold, result.getThresholdValue());
        assertEquals(alertType, result.getAlertType());
    }
}
