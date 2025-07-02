package com.example.dxc_backend.dto;

import com.example.dxc_backend.enums.AlertType;
import com.example.dxc_backend.enums.SensorType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SettingsDTOTest {

    @Test
    void testAllFieldsSetAndGet() {
        SettingsDTO dto = new SettingsDTO();
        dto.setType(SensorType.TRAFFIC);
        dto.setAlertType(AlertType.BELOW);
        dto.setMetric("avgSpeed");
        dto.setThresholdValue(45.0f);

        assertEquals(SensorType.TRAFFIC, dto.getType());
        assertEquals(AlertType.BELOW, dto.getAlertType());
        assertEquals("avgSpeed", dto.getMetric());
        assertEquals(45.0f, dto.getThresholdValue());
    }

    @Test
    void testDefaultConstructor() {
        SettingsDTO dto = new SettingsDTO();
        assertNull(dto.getType());
        assertNull(dto.getAlertType());
        assertNull(dto.getMetric());
        assertNull(dto.getThresholdValue());
    }
}
