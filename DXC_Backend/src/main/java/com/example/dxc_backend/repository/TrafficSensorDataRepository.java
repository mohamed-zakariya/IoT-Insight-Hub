package com.example.dxc_backend.repository;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface TrafficSensorDataRepository extends SensorRepositoryProvider<TrafficSensorData> {

    default SensorType getSensorType() {
        return SensorType.TRAFFIC;
    }

    Optional<TrafficSensorData> findTopByOrderByTimestampDesc();

    @SuppressWarnings("unchecked")
    default Page<TrafficSensorData> findFiltered(LocalDateTime start, LocalDateTime end, Pageable pageable, Map<String, ?> filters) {
        // Get single congestionLevel string
        String congestionLevel = filters.containsKey("congestionLevel") ?
                ((String) filters.get("congestionLevel")).trim().toLowerCase() : null;

        // Get single location string
        String location = filters.containsKey("locations") ?
                ((String) filters.get("locations")).trim().toLowerCase() : null;

        return findFilteredCustom(start, end, pageable, location, congestionLevel);
    }

    @Query("SELECT t FROM TrafficSensorData t WHERE " +
            "(:location IS NULL OR LOWER(t.location) = :location) AND " +
            "(:start IS NULL OR t.timestamp >= :start) AND " +
            "(:end IS NULL OR t.timestamp <= :end) AND " +
            "(:congestionLevel IS NULL OR LOWER(t.congestionLevel) = :congestionLevel)"
    )
    Page<TrafficSensorData> findFilteredCustom(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable,
            @Param("location") String location,
            @Param("congestionLevel") String congestionLevel
    );
}