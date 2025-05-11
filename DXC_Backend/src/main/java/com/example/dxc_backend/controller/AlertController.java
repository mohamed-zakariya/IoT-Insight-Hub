package com.example.dxc_backend.controller;

import com.example.dxc_backend.dto.AlertSummaryDTO;
import com.example.dxc_backend.model.Alert;
import com.example.dxc_backend.model.User;
import com.example.dxc_backend.repository.AlertRepository;
import com.example.dxc_backend.repository.UserRepository;
import com.example.dxc_backend.service.EmailService;
import com.example.dxc_backend.service.TokenService;
import com.example.dxc_backend.util.EmailTemplateUtil;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts", description = "Retrieve and manage triggered sensor alerts")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Operation(
            summary = "Get all alerts (message + timestamp only)",
            description = "Fetches alerts but only returns message and timestamp fields. Requires valid JWT."
    )
    @GetMapping
    public ResponseEntity<?> getAllAlerts(@RequestHeader("accessToken") String token) {
        if (!tokenService.isValidAccessToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token.");
        }

        try {
            String username = tokenService.extractUsernameFromToken(token);
            User user = userRepository.getUserByUsername(username);

            if (user != null) {
                List<Alert> alerts = alertRepository.findAll();

                // Map alerts to AlertSummaryDTO
                List<AlertSummaryDTO> summaries = alerts.stream()
                        .map(alert -> new AlertSummaryDTO(alert.getMessage(), alert.getTimestamp()))
                        .toList();

                return ResponseEntity.ok(summaries);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    @PostMapping("/send-test-email")
    @Operation(summary = "Send test alert email")
    public ResponseEntity<?> testEmail() throws MessagingException {
        String html = EmailTemplateUtil.buildAlertHtml("Traffic", "avgSpeed", 110, 90, "Above");
        emailService.sendAlertEmail(List.of("recipient@example.com"), "Test Sensor Alert", html);
        return ResponseEntity.ok("Email sent");
    }
}
