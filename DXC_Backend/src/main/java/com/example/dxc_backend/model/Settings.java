package com.example.dxc_backend.model;

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
    @GeneratedValue(strategy = GenerationType.AUTO)  // Automatically generate UUID
    private UUID id;  // Unique setting ID

    private String type;

    private String metric;

    private float thresholdValue;

    private String alertType;

    private LocalDateTime createdAt;  // Timestamp of setting creation

    // Define the many-to-one relationship with the User entity
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")  // Specify the foreign key column and the referenced column in the User table
    private User user;  // Store the associated User entity


    // Constructor to initialize the UUID if necessary
    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();  // Generate a random UUID before persisting
        }
    }
}
