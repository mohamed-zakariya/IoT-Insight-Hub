package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.enums.TrafficSensor;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.TrafficSensorDataRepository;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TrafficAlertHandler extends AbstractSensorAlertHandler<TrafficSensorData, TrafficSensor> {

    public TrafficAlertHandler(SensorRepositoryProvider<TrafficSensorData> trafficRepo) {
        super(trafficRepo, TrafficSensor.class);
    }

    @Override
    public SensorType getSensorType() {
        return SensorType.TRAFFIC;
    }

    @Override
    protected float extractMetricValue(TrafficSensorData data, TrafficSensor metric) {
        return switch (metric) {
            case TRAFFIC_DENSITY -> data.getTrafficDensity();
            case AVG_SPEED -> data.getAvgSpeed();
            case TIME_STAMP -> data.getTimestamp().getSecond();
        };
    }
}
