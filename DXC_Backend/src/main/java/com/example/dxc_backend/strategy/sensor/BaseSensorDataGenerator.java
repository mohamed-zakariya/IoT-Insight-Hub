package com.example.dxc_backend.strategy.sensor;

import java.security.SecureRandom;
import java.time.LocalDateTime;

public abstract class BaseSensorDataGenerator {

    protected final SecureRandom random = new SecureRandom();

    protected String generateRandomLocation() {
        return "Location-" + random.nextInt(100);
    }

    protected LocalDateTime generateCurrentTimestamp() {
        return LocalDateTime.now();
    }
}
