package com.example.dxc_backend.repository;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface StreetLightSensorDataRepository extends SensorRepositoryProvider<StreetLightSensorData> {


    default SensorType getSensorType() {
        return SensorType.STREET_LIGHT;
    }
    // Fetch the latest streetlight sensor record
    Optional<StreetLightSensorData> findTopByOrderByTimestampDesc();

    @Query("SELECT t FROM TrafficSensorData t WHERE " +
            "(:start IS NULL OR t.timestamp >= :start) AND " +
            "(:end IS NULL OR t.timestamp <= :end)")
    Page<StreetLightSensorData> findFiltered(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );
}
