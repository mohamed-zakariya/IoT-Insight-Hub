package com.example.dxc_backend.repository;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface AirPollutionSensorDataRepository
        extends SensorRepositoryProvider<AirPollutionSensorData> {

    @Override
    default SensorType getSensorType() {
        return SensorType.AIR_POLLUTION;
    }



    @SuppressWarnings("unchecked")
    default Page<AirPollutionSensorData> findFiltered(LocalDateTime start, LocalDateTime end, Pageable pageable, MultiValueMap<String, ?> filters) {
        // Handle multiple location values
        List<String> locations = null;
        if (filters.containsKey("location")) {
            Object locationObj = filters.get("location");
            locations = ((List<String>) locationObj).stream()
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .toList();  // changed here
        }

        return findFilteredCustom(start, end, pageable, locations);
    }

    @Query("SELECT DISTINCT t.location FROM AirPollutionSensorData t")
    Page<String> getLocations(Pageable pageable);

    @Query("SELECT t FROM AirPollutionSensorData t WHERE " +
            "(COALESCE(:locations, NULL) IS NULL OR LOWER(t.location) IN (:locations)) AND " +
            "(:start IS NULL OR t.timestamp >= :start) AND " +
            "(:end IS NULL OR t.timestamp <= :end) "
    )
    Page<AirPollutionSensorData> findFilteredCustom(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable,
            @Param("locations") List<String> locations
    );
}

