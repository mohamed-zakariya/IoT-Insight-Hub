package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.enums.SensorType;

public interface SensorAlertHandler {
    SensorType getSensorType();
    float getLatestMetricValue(String metricStr) throws Exception;
}

