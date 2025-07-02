package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.StreetLightSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StreetLightAlertHandlerTest {

    private SensorRepositoryProvider<StreetLightSensorData> mockRepo;
    private StreetLightAlertHandler handler;

    @BeforeEach
    void setUp() {
        mockRepo = mock(SensorRepositoryProvider.class);
        handler = new StreetLightAlertHandler(mockRepo);
    }

    @Test
    void testGetSensorType() {
        assertEquals(SensorType.STREET_LIGHT, handler.getSensorType());
    }

    @Test
    void testGetLatestMetricValue_returnsCorrectValues() {
        StreetLightSensorData data = new StreetLightSensorData();
        data.setBrightnessLevel(75);
        data.setPowerConsumption(150.25f);
        data.setTimestamp(LocalDateTime.of(2025, 7, 2, 15, 45, 30)); // second=30

        when(mockRepo.findLatest()).thenReturn(Optional.of(data));

        assertEquals(75, handler.getLatestMetricValue("BRIGHTNESS_LEVEL"));
        assertEquals(150.25f, handler.getLatestMetricValue("POWER_CONSUMPTION"));
        assertEquals(30f, handler.getLatestMetricValue("TIME_STAMP"));
    }

    @Test
    void testGetLatestMetricValue_invalidMetric_throws() {
        when(mockRepo.findLatest()).thenReturn(Optional.of(new StreetLightSensorData()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            handler.getLatestMetricValue("INVALID_METRIC");
        });

        assertTrue(ex.getMessage().contains("Invalid metric"));
    }

    @Test
    void testGetLatestMetricValue_noData_throws() {
        when(mockRepo.findLatest()).thenReturn(Optional.empty());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            handler.getLatestMetricValue("BRIGHTNESS_LEVEL");
        });

        assertTrue(ex.getMessage().contains("No data available"));
    }
}
