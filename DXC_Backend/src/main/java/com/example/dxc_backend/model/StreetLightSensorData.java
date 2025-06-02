package com.example.dxc_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "street_light_sensors_data")
public class StreetLightSensorData {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private int brightnessLevel;

    @Column(nullable = false)
    private float powerConsumption;

    @Column(nullable = false)
    private String status;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID(); // Generate UUID if not already set
        }
    }
}
