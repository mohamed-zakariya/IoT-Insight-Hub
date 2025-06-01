package com.example.dxc_backend.repository;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AirPollutionSensorDataRepository
        extends SensorRepositoryProvider<AirPollutionSensorData> {

    @Override
    default SensorType getSensorType() {
        return SensorType.AIR_POLLUTION;
    }

    Optional<AirPollutionSensorData> findTopByOrderByTimestampDesc();
}

