package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.enums.StreetLightSensor;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.repository.StreetLightSensorDataRepository;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class StreetLightAlertHandler extends AbstractSensorAlertHandler<StreetLightSensorData, StreetLightSensor> {

    public StreetLightAlertHandler(SensorRepositoryProvider<StreetLightSensorData> lightRepo) {
        super(lightRepo, StreetLightSensor.class);
    }

    @Override
    public SensorType getSensorType() {
        return SensorType.STREET_LIGHT;
    }

    @Override
    protected float extractMetricValue(StreetLightSensorData data, StreetLightSensor metric) {
        return switch (metric) {
            case BRIGHTNESS_LEVEL -> data.getBrightnessLevel();
            case POWER_CONSUMPTION -> data.getPowerConsumption();
            case TIME_STAMP -> data.getTimestamp().getSecond();
        };
    }
}

