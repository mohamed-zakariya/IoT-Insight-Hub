package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.enums.TrafficSensor;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.TrafficSensorDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TrafficAlertHandler implements SensorAlertHandler {

    @Autowired
    private TrafficSensorDataRepository trafficRepo;

    @Override
    public SensorType getSensorType() {
        return SensorType.TRAFFIC;
    }

    @Override
    public float getLatestMetricValue(String metricStr) {
        TrafficSensor metric;
        try {
            metric = TrafficSensor.valueOf(metricStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Traffic metric: " + metricStr, e);
        }

        TrafficSensorData latestData = trafficRepo.findTopByOrderByTimestampDesc()
                .orElseThrow(() -> new IllegalStateException("No traffic data available"));

        return switch (metric) {
            case TRAFFIC_DENSITY -> latestData.getTrafficDensity();
            case AVG_SPEED -> latestData.getAvgSpeed();
            case TIME_STAMP -> latestData.getTimestamp().getSecond();
        };
    }
}
