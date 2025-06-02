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

import java.util.List;
import java.util.Optional;


@Repository
public interface TrafficSensorDataRepository extends SensorRepositoryProvider<TrafficSensorData> {

    default SensorType getSensorType() {
        return SensorType.TRAFFIC;
    }
    // Fetch the latest traffic sensor record
    Optional<TrafficSensorData> findTopByOrderByTimestampDesc();
//
//    // Dynamic filtering with pagination
//    @Query("SELECT t FROM TrafficSensorData t WHERE " +
////            "(:locations IS NULL OR LOWER(t.location) IN :locations) AND " +
//            "(:start IS NULL OR t.timestamp >= :start) AND " +
//            "(:end IS NULL OR t.timestamp <= :end) AND "
////            "(:congestionLevels IS NULL OR LOWER(t.congestionLevel) IN :congestionLevels)"
//    )
//    Page<TrafficSensorData> findFiltered(
////            @Param("locations") List<String> locations,
//            @Param("start") LocalDateTime start,
//            @Param("end") LocalDateTime end,
////            @Param("congestionLevels") List<String> congestionLevels,
//            Pageable pageable
//    );
@Query("SELECT t FROM TrafficSensorData t WHERE " +
        "(:start IS NULL OR t.timestamp >= :start) AND " +
        "(:end IS NULL OR t.timestamp <= :end)")
Page<TrafficSensorData> findFiltered(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        Pageable pageable
);
}