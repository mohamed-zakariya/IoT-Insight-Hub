package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.TrafficSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TrafficAlertHandlerTest {

    private SensorRepositoryProvider<TrafficSensorData> mockRepo;
    private TrafficAlertHandler handler;

    @BeforeEach
    void setUp() {
        mockRepo = mock(SensorRepositoryProvider.class);
        handler = new TrafficAlertHandler(mockRepo);
    }

    @Test
    void testGetSensorType() {
        assertEquals(SensorType.TRAFFIC, handler.getSensorType());
    }

    @Test
    void testGetLatestMetricValue_returnsCorrectValues() {
        TrafficSensorData data = new TrafficSensorData();
        data.setTrafficDensity(150);
        data.setAvgSpeed(75.5f);
        data.setTimestamp(LocalDateTime.of(2025, 7, 2, 12, 0, 34)); // second=34

        when(mockRepo.findLatest()).thenReturn(Optional.of(data));

        // Test TRAFFIC_DENSITY metric
        float density = handler.getLatestMetricValue("TRAFFIC_DENSITY");
        assertEquals(150, density);

        // Test AVG_SPEED metric
        float speed = handler.getLatestMetricValue("AVG_SPEED");
        assertEquals(75.5f, speed, 0.0001);

        // Test TIME_STAMP metric (seconds part)
        float second = handler.getLatestMetricValue("TIME_STAMP");
        assertEquals(34, second);
    }

    @Test
    void testGetLatestMetricValue_invalidMetric_throws() {
        when(mockRepo.findLatest()).thenReturn(Optional.of(new TrafficSensorData()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            handler.getLatestMetricValue("INVALID_METRIC");
        });

        assertTrue(ex.getMessage().contains("Invalid metric"));
    }

    @Test
    void testGetLatestMetricValue_noData_throws() {
        when(mockRepo.findLatest()).thenReturn(Optional.empty());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            handler.getLatestMetricValue("TRAFFIC_DENSITY");
        });

        assertTrue(ex.getMessage().contains("No data available"));
    }
}
