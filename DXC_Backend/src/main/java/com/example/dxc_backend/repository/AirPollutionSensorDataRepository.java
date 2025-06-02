package com.example.dxc_backend.repository;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Repository
public interface AirPollutionSensorDataRepository
        extends SensorRepositoryProvider<AirPollutionSensorData> {

    @Override
    default SensorType getSensorType() {
        return SensorType.AIR_POLLUTION;
    }

    Optional<AirPollutionSensorData> findTopByOrderByTimestampDesc();

    @Override
    default Page<AirPollutionSensorData> findFiltered(LocalDateTime start, LocalDateTime end, Pageable pageable, MultiValueMap<String, ?> filters) {
        return findFilteredCustom(start, end, pageable);
    }

    @Query("SELECT t FROM TrafficSensorData t WHERE " +
        "(:start IS NULL OR t.timestamp >= :start) AND " +
        "(:end IS NULL OR t.timestamp <= :end)")
    Page<AirPollutionSensorData> findFilteredCustom(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );


}

