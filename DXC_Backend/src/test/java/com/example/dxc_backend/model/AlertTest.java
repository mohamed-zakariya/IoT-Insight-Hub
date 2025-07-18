package com.example.dxc_backend.model;

import com.example.dxc_backend.enums.AlertType;
import com.example.dxc_backend.enums.SensorType;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class AlertTest {

    @Test
    void testAlertModel() {
        Alert alert = new Alert();
        alert.setId(UUID.randomUUID());
        alert.setType(SensorType.TRAFFIC);
        alert.setMetric("avgSpeed");
        alert.setMetricValue(110);
        alert.setThresholdValue(90);
        alert.setAlertType(AlertType.ABOVE);
        alert.setMessage("Speed above threshold");
        alert.onCreate();  // Simulates @PrePersist

        assertNotNull(alert.getId());
        assertEquals(SensorType.TRAFFIC, alert.getType());
        assertEquals("avgSpeed", alert.getMetric());
        assertEquals(110, alert.getMetricValue());
        assertEquals(90, alert.getThresholdValue());
        assertEquals(AlertType.ABOVE, alert.getAlertType());
        assertEquals("Speed above threshold", alert.getMessage());
        assertNotNull(alert.getTimestamp());
        assertTrue(alert.getTimestamp().isBefore(LocalDateTime.now().plusSeconds(1)));
    }
}
