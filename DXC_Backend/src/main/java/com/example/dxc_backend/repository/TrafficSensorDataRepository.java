package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.TrafficSensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TrafficSensorDataRepository extends JpaRepository<TrafficSensorData, UUID> {

    // Fetch the latest traffic sensor record
    Optional<TrafficSensorData> findTopByOrderByTimestampDesc();

    // Dynamic filtering with pagination
    @Query("SELECT t FROM TrafficSensorData t WHERE " +
            "(:locations IS NULL OR LOWER(t.location) IN :locations) AND " +
            "(:start IS NULL OR t.timestamp >= :start) AND " +
            "(:end IS NULL OR t.timestamp <= :end) AND " +
            "(:congestionLevels IS NULL OR LOWER(t.congestionLevel) IN :congestionLevels)")
    Page<TrafficSensorData> findFiltered(
            @Param("locations") List<String> locations,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("congestionLevels") List<String> congestionLevels,
            Pageable pageable
    );
}