package com.example.dxc_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "air_pollution_sensors_data")
public class AirPollutionSensorData {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime timestamp;


    @Column(nullable = false)
    private float co;

    @Column(nullable = false)
    private float no2;

    @Column(nullable = false)
    private float so2;

    @Column(nullable = false)
    private float ozone;

    @Column(nullable = false)
    private String pollutionLevel;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID(); // Generate UUID if not already set
        }
    }
}
