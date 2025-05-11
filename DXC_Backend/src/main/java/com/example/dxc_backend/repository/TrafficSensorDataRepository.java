package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.TrafficSensorData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TrafficSensorDataRepository extends JpaRepository<TrafficSensorData, UUID> {

    // Fetch the latest traffic sensor record
    Optional<TrafficSensorData> findTopByOrderByTimestampDesc();
}
