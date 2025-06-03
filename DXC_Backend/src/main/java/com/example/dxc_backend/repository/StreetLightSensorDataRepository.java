package com.example.dxc_backend.repository;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public interface  StreetLightSensorDataRepository extends SensorRepositoryProvider<StreetLightSensorData> {


    default SensorType getSensorType() {
        return SensorType.STREET_LIGHT;
    }
    // Fetch the latest streetlight sensor record

    @Query("SELECT DISTINCT t.location FROM StreetLightSensorData t")
    Page<String> getLocations(Pageable pageable);

    @SuppressWarnings("unchecked")
    default Page<StreetLightSensorData> findFiltered(LocalDateTime start, LocalDateTime end, Pageable pageable, MultiValueMap<String, ?> filters) {

        List<String> status = null;
        if (filters.containsKey("status")) {
            Object locationObj = filters.get("status");
            status = ((List<String>) locationObj).stream()
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());
        }

        // Handle multiple location values
        List<String> locations = null;
        if (filters.containsKey("location")) {
            Object locationObj = filters.get("location");
            locations = ((List<String>) locationObj).stream()
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());
        }

        return findFilteredCustom(start, end, pageable, locations, status);
    }


    @Query("SELECT t FROM StreetLightSensorData t WHERE " +
            "(COALESCE(:locations, NULL) IS NULL OR LOWER(t.location) IN (:locations)) AND " +
            "(:start IS NULL OR t.timestamp >= :start) AND " +
            "(:end IS NULL OR t.timestamp <= :end) AND " +
            "(COALESCE(:status, NULL) IS NULL OR LOWER(t.status) IN (:status))"
    )
    Page<StreetLightSensorData> findFilteredCustom(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable,
            @Param("locations") List<String> locations,
            @Param("status") List<String> status
    );
}
