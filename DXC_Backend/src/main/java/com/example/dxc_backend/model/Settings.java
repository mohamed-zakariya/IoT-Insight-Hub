package com.example.dxc_backend.model;

import com.example.dxc_backend.enums.AlertType;
import com.example.dxc_backend.enums.SensorType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "settings")
@Getter
@Setter
public class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;


    private String metric;

    private float thresholdValue;

    @Enumerated(EnumType.STRING)
    private AlertType alertType;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private SensorType type;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
