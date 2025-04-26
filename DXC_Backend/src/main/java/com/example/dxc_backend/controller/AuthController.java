package com.example.dxc_backend.controller;

import com.example.dxc_backend.model.Token;
import com.example.dxc_backend.repository.TokenRepository;
import com.example.dxc_backend.service.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = {"http://localhost:4201", "http://localhost:4200"})
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private TokenRepository tokenRepository;

    @Operation(summary = "generate access   ", description = "hh  ")
    @PostMapping("/generate-access-token")
    public String generateAccessToken(@RequestParam String username) {
        return tokenService.createAccessToken(username);
    }

    @Operation(summary = "generate refresh token and saves it in data base  ", description = "generate a refresh code and saves it in the database  ")
    @PostMapping("/generate-refresh-token")
    public String generateRefreshToken(@RequestParam String username) {
        return tokenService.createRefreshToken(username);
    }

    @PostMapping("/validate-access-token")
    public boolean validateAccessToken(@RequestParam String token) {
        return tokenService.isValidAccessToken(token);
    }

    // want to get mioodified with the validation of the database will make another one
    @PostMapping("/validate-refresh-token")
    public boolean validateRefreshToken(@RequestParam String token) {
        return tokenService.isValidRefreshToken(token);
    }


    // lets make a api that make a validation with database of the refresh
    //will maek function from the service better
    //first we need to check if this validated by the key and the time ?
    //after that we will see if it matches with any refresh key is it ok after all of this we will
    //generat a new acces token with the username yes for the user id is a foregin key with the user table
    //lol after all of this it should work well
    @Operation(summary = "Check the refresh token to send acces token ", description = "Check the refresh token to send acces token and validate it if its expired or not ")
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestParam String refreshToken) {
        try {
            // Validate Time and key
            if (!tokenService.isValidRefreshToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired refresh token.");
            }

            // Check if the refresh token in the database
            Token storedToken = tokenService.getRefreshTokenFromDatabase(refreshToken);
            if (storedToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token not found in the database.");
            }

            // Generate a new access token

            String newAccessToken = tokenService.createAccessToken(tokenService.Return_username(storedToken));

            // Prepare the response
            Map<String, String> responseBody = Map.of(
                    "message", "Token refreshed successfully!",
                    "accessToken", newAccessToken
            );

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while refreshing the token.");
        }
    }
}
