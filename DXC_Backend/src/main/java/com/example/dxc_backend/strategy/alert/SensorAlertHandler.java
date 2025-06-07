package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.strategy.sensor.SensorTypeStrategy;

public interface SensorAlertHandler extends SensorTypeStrategy {
    float getLatestMetricValue(String metricStr) throws Exception;
}
