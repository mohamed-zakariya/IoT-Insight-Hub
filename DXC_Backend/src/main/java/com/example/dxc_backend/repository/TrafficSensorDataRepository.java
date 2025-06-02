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
import java.util.stream.Collectors;

@Repository
public interface TrafficSensorDataRepository extends SensorRepositoryProvider<TrafficSensorData> {

    default SensorType getSensorType() {
        return SensorType.TRAFFIC;
    }

    Optional<TrafficSensorData> findTopByOrderByTimestampDesc();

    @Override
    default Page<TrafficSensorData> findFiltered(LocalDateTime start, LocalDateTime end, Pageable pageable, Map<String, ?> filters) {
        // Handle congestionLevels - could be String or List<String>
        List<String> congestionLevels = convertFilterParam(filters.get("congestionLevel"));

        // Handle locations - could be String or List<String>
        List<String> locations = convertFilterParam(filters.get("locations"));

        return findFilteredCustom(start, end, pageable, locations, congestionLevels);
    }

    // Helper method to handle both single String and List<String> parameters
    private List<String> convertFilterParam(Object param) {
        if (param == null) {
            return null;
        } else if (param instanceof String) {
            return Collections.singletonList(((String) param).toLowerCase());
        } else if (param instanceof List) {
            return ((List<?>) param).stream()
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());
        }
        return null;
    }
    @Query("SELECT t FROM TrafficSensorData t WHERE " +
            "(COALESCE(:locations, NULL) IS NULL OR LOWER(t.location) IN (:locations)) AND " +
            "(:start IS NULL OR t.timestamp >= :start) AND " +
            "(:end IS NULL OR t.timestamp <= :end) AND " +
            "(COALESCE(:congestionLevels, NULL) IS NULL OR LOWER(t.congestionLevel) IN (:congestionLevels))"
    )
    Page<TrafficSensorData> findFilteredCustom(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable,
            @Param("locations") List<String> locations,
            @Param("congestionLevels") List<String> congestionLevels
    );
}