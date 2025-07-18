package com.example.dxc_backend.repository;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Repository;
import org.springframework.util.MultiValueMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Repository
public interface TrafficSensorDataRepository extends SensorRepositoryProvider<TrafficSensorData> {

    Logger logger = LoggerFactory.getLogger(TrafficSensorDataRepository.class);

    default SensorType getSensorType() {
        return SensorType.TRAFFIC;
    }

    @Query("SELECT DISTINCT t.location FROM TrafficSensorData t")
    Page<String> getLocations(Pageable pageable); // TODO: Extract to common base if needed

    default Page<TrafficSensorData> findFiltered(LocalDateTime start, LocalDateTime end, Pageable pageable, MultiValueMap<String, ?> filters) {
        List<String> congestionLevels = null;

        if (filters.containsKey("congestionLevel")) {
            Object congestionLevelObj = filters.getFirst("congestionLevel");

            if (congestionLevelObj instanceof String s) {
                congestionLevels = Collections.singletonList(s.trim().toLowerCase());
                logger.info("Filtered congestion level: {}", congestionLevels);
            } else if (congestionLevelObj instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof String) {
                congestionLevels = list.stream()
                        .map(e -> ((String) e).trim().toLowerCase())
                        .toList(); // Java 16+
            }
        }

        List<String> locations = null;
        if (filters.containsKey("location")) {
            Object locationObj = filters.getFirst("location");

            if (locationObj instanceof String s) {
                locations = Collections.singletonList(s.trim().toLowerCase());
            } else if (locationObj instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof String) {
                locations = list.stream()
                        .map(e -> ((String) e).trim().toLowerCase())
                        .toList(); // Java 16+
            }
        }

        return findFilteredCustom(start, end, pageable, locations, congestionLevels);
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
