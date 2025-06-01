// path: com.example.dxc_backend.strategy.generator.BaseSensorDataGenerator.java
package com.example.dxc_backend.strategy.generator;

import java.time.LocalDateTime;
import java.util.Random;

public class BaseSensorDataGenerator {
    protected final Random random = new Random();

    protected String generateRandomLocation() {
        return "Location-" + random.nextInt(100);
    }

    protected LocalDateTime generateCurrentTimestamp() {
        return LocalDateTime.now();
    }
}
