package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
}
