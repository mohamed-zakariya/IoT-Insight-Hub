package com.example.dxc_backend.model;

import com.example.dxc_backend.enums.AlertType;
import com.example.dxc_backend.enums.SensorType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private SensorType type;

    private String metric; // e.g., "avgSpeed", "co", "brightnessLevel"

    private float metricValue; // The actual value that triggered the alert

    private float thresholdValue; // From the Settings table

    private AlertType alertType;

    private String message; // Human-readable explanation

    private LocalDateTime timestamp;

    @PrePersist
    public void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
