package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.enums.AirPollutionSensor;
import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.repository.AirPollutionSensorDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AirPollutionAlertHandler implements SensorAlertHandler {

    @Autowired
    private AirPollutionSensorDataRepository airRepo;

    @Override
    public SensorType getSensorType() {
        return SensorType.AIR_POLLUTION;
    }

    @Override
    public float getLatestMetricValue(String metricStr) {
        AirPollutionSensor metric;
        try {
            metric = AirPollutionSensor.valueOf(metricStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Air Pollution metric: " + metricStr, e);
        }

        AirPollutionSensorData latest = airRepo.findTopByOrderByTimestampDesc()
                .orElseThrow(() -> new IllegalStateException("No Air Pollution data available"));

        return switch (metric) {
            case CO -> latest.getCo();
            case SO2 -> latest.getSo2();
            case NO2 -> latest.getNo2();
            case OZONE -> latest.getOzone();
            case TIME_STAMP -> latest.getTimestamp().getSecond();
        };
    }
}
