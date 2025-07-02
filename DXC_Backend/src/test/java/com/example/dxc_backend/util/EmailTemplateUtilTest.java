package com.example.dxc_backend.util;

import com.example.dxc_backend.enums.SensorType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmailTemplateUtilTest {

    @Test
    void testBuildAlertHtmlWithTrafficSensor() {
        String html = EmailTemplateUtil.buildAlertHtml(
                SensorType.TRAFFIC,
                "Traffic Density",
                85.7f,
                70.0f,
                "above"
        );

        assertNotNull(html);
        assertTrue(html.contains("TRAFFIC"));
        assertTrue(html.contains("Traffic Density"));
        assertTrue(html.contains("85.70"));
        assertTrue(html.contains("70.00"));
        assertTrue(html.contains("above"));
    }

    @Test
    void testBuildAlertHtmlWithAirPollutionSensor() {
        String html = EmailTemplateUtil.buildAlertHtml(
                SensorType.AIR_POLLUTION,
                "PM2.5 Level",
                150.5f,
                100.0f,
                "above"
        );

        assertNotNull(html);
        assertTrue(html.contains("AIR_POLLUTION"));
        assertTrue(html.contains("PM2.5 Level"));
        assertTrue(html.contains("150.50"));
        assertTrue(html.contains("100.00"));
        assertTrue(html.contains("above"));
    }

    @Test
    void testBuildAlertHtmlWithStreetLightSensor() {
        String html = EmailTemplateUtil.buildAlertHtml(
                SensorType.STREET_LIGHT,
                "Light Intensity",
                300.0f,
                250.0f,
                "below"
        );

        assertNotNull(html);
        assertTrue(html.contains("STREET_LIGHT"));
        assertTrue(html.contains("Light Intensity"));
        assertTrue(html.contains("300.00"));
        assertTrue(html.contains("250.00"));
        assertTrue(html.contains("below"));
    }
}
