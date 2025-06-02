package com.example.dxc_backend.model;

import jakarta.persistence.Column;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import java.util.UUID;

import lombok.Data;


@Data
@Entity
@Table(name = "traffic_sensors_data")
public class TrafficSensorData {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private int trafficDensity;

    @Column(nullable = false)
    private float avgSpeed;

    @Column(nullable = false)
    private String congestionLevel;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();   // Generate UUID if it's not already set
        }
    }
    public UUID getId() {
        return id;
    }

    public String getLocation() {
        return location;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getTrafficDensity() {
        return trafficDensity;
    }

    public float getAvgSpeed() {
        return avgSpeed;
    }

    public String getCongestionLevel() {
        return congestionLevel;
    }



}



