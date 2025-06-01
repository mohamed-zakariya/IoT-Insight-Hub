package com.example.dxc_backend.repository;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StreetLightSensorDataRepository extends SensorRepositoryProvider<StreetLightSensorData> {


    default SensorType getSensorType() {
        return SensorType.STREET_LIGHT;
    }
    // Fetch the latest streetlight sensor record
    Optional<StreetLightSensorData> findTopByOrderByTimestampDesc();
}
