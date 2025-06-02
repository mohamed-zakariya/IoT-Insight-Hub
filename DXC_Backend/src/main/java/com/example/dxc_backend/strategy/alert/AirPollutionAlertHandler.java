package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.enums.AirPollutionSensor;
import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.repository.AirPollutionSensorDataRepository;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import com.example.dxc_backend.service.SensorDataUnifiedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AirPollutionAlertHandler extends AbstractSensorAlertHandler<AirPollutionSensorData, AirPollutionSensor> {

    public AirPollutionAlertHandler(SensorRepositoryProvider<AirPollutionSensorData> airRepo) {
        super(airRepo, AirPollutionSensor.class);
    }

    @Override
    public SensorType getSensorType() {
        return SensorType.AIR_POLLUTION;
    }

    @Override
    protected float extractMetricValue(AirPollutionSensorData data, AirPollutionSensor metric) {
        return switch (metric) {
            case CO -> data.getCo();
            case SO2 -> data.getSo2();
            case NO2 -> data.getNo2();
            case OZONE -> data.getOzone();
            case TIME_STAMP -> data.getTimestamp().getSecond();
        };
    }
}

