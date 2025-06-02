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
import org.springframework.util.MultiValueMap;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public interface TrafficSensorDataRepository extends SensorRepositoryProvider<TrafficSensorData> {

    default SensorType getSensorType() {
        return SensorType.TRAFFIC;
    }

    Optional<TrafficSensorData> findTopByOrderByTimestampDesc();

    @SuppressWarnings("unchecked")
    default Page<TrafficSensorData> findFiltered(LocalDateTime start, LocalDateTime end, Pageable pageable, MultiValueMap<String, ?> filters) {
        // Handle multiple congestionLevel values
        List<String> congestionLevels = null;
        if (filters.containsKey("congestionLevel")) {
            Object congestionLevelObj = filters.get("congestionLevel");

            if (congestionLevelObj instanceof String) {
                congestionLevels = Collections.singletonList(((String) congestionLevelObj).trim().toLowerCase());

            } else if (congestionLevelObj instanceof List) {
                congestionLevels = ((List<String>) congestionLevelObj).stream()
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .collect(Collectors.toList());
            }
        }
        System.out.println(filters);
        // Handle multiple location values
        List<String> locations = null;
        if (filters.containsKey("location")) {
            Object locationObj = filters.get("location");

            if (locationObj instanceof String) {
                locations = Collections.singletonList(((String) locationObj).trim().toLowerCase());
                System.out.println("str" + locations);
            } else if (locationObj instanceof List) {
                locations = ((List<String>) locationObj).stream()
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .collect(Collectors.toList());
                System.out.println("list" + locations);
            }
        }

        return findFilteredCustom(start, end, pageable, locations, congestionLevels);
    }

    public static <V> V getIgnoreCaseKey(Map<String, V> map, String key) {
        for (String k : map.keySet()) {
            if (k.equalsIgnoreCase(key)) {
                return map.get(k);
            }
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