package com.example.dxc_backend.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class AlertSummaryDTOTest {

    @Test
    void testAlertSummaryDTOFields() {
        String message = "Test alert";
        LocalDateTime now = LocalDateTime.now();

        AlertSummaryDTO dto = new AlertSummaryDTO(message, now);

        assertEquals(message, dto.getMessage());
        assertEquals(now, dto.getTimestamp());
    }
}
