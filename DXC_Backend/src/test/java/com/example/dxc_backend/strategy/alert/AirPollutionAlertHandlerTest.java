package com.example.dxc_backend.strategy.alert;

import com.example.dxc_backend.enums.SensorType;
import com.example.dxc_backend.model.AirPollutionSensorData;
import com.example.dxc_backend.repository.base.SensorRepositoryProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AirPollutionAlertHandlerTest {

    private SensorRepositoryProvider<AirPollutionSensorData> mockRepo;
    private AirPollutionAlertHandler handler;

    @BeforeEach
    void setUp() {
        mockRepo = mock(SensorRepositoryProvider.class);
        handler = new AirPollutionAlertHandler(mockRepo);
    }

    @Test
    void testGetSensorType() {
        assertEquals(SensorType.AIR_POLLUTION, handler.getSensorType());
    }

    @Test
    void testGetLatestMetricValue_returnsCorrectValues() {
        AirPollutionSensorData data = new AirPollutionSensorData();
        data.setCo(10.5f);
        data.setSo2(5.5f);
        data.setNo2(7.3f);
        data.setOzone(12.1f);
        data.setTimestamp(LocalDateTime.of(2025, 7, 2, 14, 30, 45));  // second=45

        when(mockRepo.findLatest()).thenReturn(Optional.of(data));

        assertEquals(10.5f, handler.getLatestMetricValue("CO"));
        assertEquals(5.5f, handler.getLatestMetricValue("SO2"));
        assertEquals(7.3f, handler.getLatestMetricValue("NO2"));
        assertEquals(12.1f, handler.getLatestMetricValue("OZONE"));
        assertEquals(45f, handler.getLatestMetricValue("TIME_STAMP"));
    }

    @Test
    void testGetLatestMetricValue_invalidMetric_throws() {
        when(mockRepo.findLatest()).thenReturn(Optional.of(new AirPollutionSensorData()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            handler.getLatestMetricValue("INVALID_METRIC");
        });

        assertTrue(ex.getMessage().contains("Invalid metric"));
    }

    @Test
    void testGetLatestMetricValue_noData_throws() {
        when(mockRepo.findLatest()).thenReturn(Optional.empty());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            handler.getLatestMetricValue("CO");
        });

        assertTrue(ex.getMessage().contains("No data available"));
    }
}
