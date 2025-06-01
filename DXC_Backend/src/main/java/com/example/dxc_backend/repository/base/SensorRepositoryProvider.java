package com.example.dxc_backend.repository.base;

import com.example.dxc_backend.enums.SensorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.UUID;


@NoRepositoryBean
public interface SensorRepositoryProvider<T> extends JpaRepository<T, UUID> {
    SensorType getSensorType();
}


