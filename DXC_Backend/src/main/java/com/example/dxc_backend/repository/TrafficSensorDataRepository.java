package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.TrafficSensorData;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface TrafficSensorDataRepository extends JpaRepository<TrafficSensorData, UUID> {

    // Fetch the latest traffic sensor record
    Optional<TrafficSensorData> findTopByOrderByTimestampDesc();

    // Dynamic filtering with pagination
    @Query("SELECT t FROM TrafficSensorData t WHERE " +
            "(:location IS NULL OR LOWER(t.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:start IS NULL OR t.timestamp >= :start) AND " +
            "(:end IS NULL OR t.timestamp <= :end) AND " +
            "(:congestionLevel IS NULL OR LOWER(t.congestionLevel) = LOWER(:congestionLevel))")
    Page<TrafficSensorData> findFiltered(
            @Param("location") String location,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("congestionLevel") String congestionLevel,
            Pageable pageable
    );
}