package com.example.dxc_backend.controller;

import com.example.dxc_backend.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private TokenService tokenService;

    @PostMapping("/generate-access-token")
    public String generateAccessToken(@RequestParam String username) {
        return tokenService.createAccessToken(username);
    }

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
}
