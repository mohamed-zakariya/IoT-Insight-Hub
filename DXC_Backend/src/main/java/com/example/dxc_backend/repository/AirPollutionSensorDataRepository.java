package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.AirPollutionSensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AirPollutionSensorDataRepository extends JpaRepository<AirPollutionSensorData, UUID> {
}
