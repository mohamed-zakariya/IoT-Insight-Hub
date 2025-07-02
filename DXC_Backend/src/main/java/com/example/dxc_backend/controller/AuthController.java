package com.example.dxc_backend.controller;

import com.example.dxc_backend.model.Token;
import com.example.dxc_backend.service.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = {"http://localhost:4201", "http://localhost:4200"})
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final TokenService tokenService;

    public AuthController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Operation(summary = "generate access", description = "generate access token")
    @PostMapping("/generate-access-token")
    public String generateAccessToken(@RequestParam String username) {
        return tokenService.createAccessToken(username);
    }

    @Operation(summary = "generate refresh token and save it in database", description = "generate and store refresh token")
    @PostMapping("/generate-refresh-token")
    public String generateRefreshToken(@RequestParam String username) {
        return tokenService.createRefreshToken(username);
    }

    @PostMapping("/validate-access-token")
    public boolean validateAccessToken(@RequestParam String token) {
        return tokenService.isValidAccessToken(token);
    }

    @PostMapping("/validate-refresh-token")
    public boolean validateRefreshToken(@RequestParam String token) {
        return tokenService.isValidRefreshToken(token);
    }

    @Operation(summary = "Check refresh token and return access token", description = "Validate refresh token and issue new access token")
    @PostMapping("/refresh-token")
    public ResponseEntity<Object> refreshToken(@RequestParam String refreshToken) {
        try {
            if (!tokenService.isValidRefreshToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired refresh token.");
            }

            Token storedToken = tokenService.getRefreshTokenFromDatabase(refreshToken);
            if (storedToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Refresh token not found in the database.");
            }

            String newAccessToken = tokenService.createAccessToken(tokenService.Return_username(storedToken));

            Map<String, String> responseBody = Map.of(
                    "message", "Token refreshed successfully!",
                    "accessToken", newAccessToken
            );

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while refreshing the token.");
        }
    }
}
