package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.Settings;
import com.example.dxc_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, UUID> {

    List<Settings> findAllByType(String type);

    Optional<Settings> findByTypeAndMetric(String type, String metric);

    void deleteByTypeAndMetric(String type, String metric);
}
