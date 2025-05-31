// path: com.example.dxc_backend.generator.BaseSensorDataGenerator.java
package com.example.dxc_backend.generator;

import java.time.LocalDateTime;
import java.util.Random;

public abstract class BaseSensorDataGenerator {
    protected final Random random = new Random();

    protected String generateRandomLocation() {
        return "Location-" + random.nextInt(100);
    }

    protected LocalDateTime generateCurrentTimestamp() {
        return LocalDateTime.now();
    }
}
