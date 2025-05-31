package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.enums.StreetLightSensor;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.repository.StreetLightSensorDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class StreetLightAlertHandler implements SensorAlertHandler {

    @Autowired
    private StreetLightSensorDataRepository lightRepo;

    @Override
    public SensorType getSensorType() {
        return SensorType.STREET_LIGHT;
    }

    @Override
    public float getLatestMetricValue(String metricStr) {
        StreetLightSensor metric;
        try {
            metric = StreetLightSensor.valueOf(metricStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Street Light metric: " + metricStr, e);
        }

        StreetLightSensorData latest = lightRepo.findTopByOrderByTimestampDesc()
                .orElseThrow(() -> new IllegalStateException("No Street Light data available"));

        return switch (metric) {
            case BRIGHTNESS_LEVEL -> latest.getBrightnessLevel();
            case POWER_CONSUMPTION -> latest.getPowerConsumption();
            case TIME_STAMP -> latest.getTimestamp().getSecond();
        };
    }
}
