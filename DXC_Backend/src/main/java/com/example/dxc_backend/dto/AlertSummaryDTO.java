package com.example.dxc_backend.dto;

import java.time.LocalDateTime;

public class AlertSummaryDTO {
    private String message;
    private LocalDateTime timestamp;

    public AlertSummaryDTO(String message, LocalDateTime timestamp) {
        this.message = message;
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
