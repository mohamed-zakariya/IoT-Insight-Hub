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

    // Find all settings for a specific user by user entity
    List<Settings> findAllByUser(User user);

    // Find a setting by user entity, type, and metric
    Optional<Settings> findByUserAndTypeAndMetric(User user, String type, String metric);

    // Delete a setting by user entity, type, and metric
    void deleteByUserAndTypeAndMetric(User user, String type, String metric);
}
