package com.example.dxc_backend.repository.base;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.TrafficSensorData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@NoRepositoryBean
public interface SensorRepositoryProvider<T> extends JpaRepository<T, UUID> {
    SensorType getSensorType();

    Page<T> findFiltered(LocalDateTime start, LocalDateTime end, Pageable pageable, MultiValueMap<String, ?> filters);

    Page<String> getLocations(  Pageable pageable);
}