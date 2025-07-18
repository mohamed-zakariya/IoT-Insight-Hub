package com.example.dxc_backend.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SensorTypeTest {

    @Test
    void testFrom_ValidValues() {
        assertEquals(SensorType.TRAFFIC, SensorType.from("traffic"));
        assertEquals(SensorType.AIR_POLLUTION, SensorType.from("Air_Pollution"));
        assertEquals(SensorType.STREET_LIGHT, SensorType.from("STREET_LIGHT"));
    }

    @Test
    void testFrom_InvalidValue_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> SensorType.from("invalid"));
    }

    @Test
    void testEnumValues() {
        SensorType[] values = SensorType.values();
        assertEquals(3, values.length);
        assertTrue(java.util.Arrays.asList(values).contains(SensorType.TRAFFIC));
        assertTrue(java.util.Arrays.asList(values).contains(SensorType.AIR_POLLUTION));
        assertTrue(java.util.Arrays.asList(values).contains(SensorType.STREET_LIGHT));
    }
}
