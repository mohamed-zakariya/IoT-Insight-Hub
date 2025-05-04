package com.example.dxc_backend.controller;

import com.example.dxc_backend.model.Alert;
import com.example.dxc_backend.repository.AlertRepository;
import com.example.dxc_backend.service.EmailService;
import com.example.dxc_backend.util.EmailTemplateUtil;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts", description = "Retrieve and manage triggered sensor alerts")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @Operation(
            summary = "Get all alerts",
            description = "Fetches a list of all alerts that were triggered when sensor values exceeded or fell below user-defined thresholds"
    )
    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertRepository.findAll());
    }


    @PostMapping("/send-test-email")
    @Operation(summary = "Send test alert email")
    public ResponseEntity<?> testEmail() throws MessagingException {
        String html = EmailTemplateUtil.buildAlertHtml("Traffic", "avgSpeed", 110, 90, "Above");
        EmailService mailService = null;
        mailService.sendAlertEmail(List.of("recipient@example.com"), "Test Sensor Alert", html);
        return ResponseEntity.ok("Email sent");
    }

}

