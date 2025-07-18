package com.example.dxc_backend.controller;

import com.example.dxc_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"http://localhost:4201", "http://localhost:4200"})
@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final UserService userService;

    public PasswordResetController(UserService userService){
        this.userService = userService;
    }

    // Endpoint to send OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<Object> forgotPassword(@RequestParam String email) {
        try {
            userService.sendOtpToEmail(email);
            return ResponseEntity.ok("OTP has been sent to your email.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // Endpoint to verify OTP and reset password
    @PostMapping("/verify-otp")
    public ResponseEntity<Object> verifyOtpAndResetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword
    ) {
        boolean success = userService.verifyOtpAndResetPassword(email, otp, newPassword);
        if (success) {
            return ResponseEntity.ok("Password has been reset successfully.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired OTP.");
        }
    }

    // Endpoint to check OTP validity
    @PostMapping("/check-otp")
    public ResponseEntity<Object> checkOtpValidity(@RequestParam String otp) {
        String result = userService.checkOtpValidity(otp);
        return ResponseEntity.ok(result);
    }

}
