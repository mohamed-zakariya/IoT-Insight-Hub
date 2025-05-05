package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.StreetLightSensorData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StreetLightSensorDataRepository extends JpaRepository<StreetLightSensorData, UUID> {

    // Fetch the latest streetlight sensor record
    Optional<StreetLightSensorData> findTopByOrderByTimestampDesc();
}
