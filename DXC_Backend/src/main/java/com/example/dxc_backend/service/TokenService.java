package com.example.dxc_backend.service;

import com.example.dxc_backend.model.Token;
import com.example.dxc_backend.repository.TokenRepository;
import com.example.dxc_backend.repository.UserRepository;
import com.example.dxc_backend.util.JwtUtil;
import jakarta.persistence.Id;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
public class TokenService {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    // Generate Access Token
    public String createAccessToken(String username) {
        String token = jwtUtil.generateAccessToken(username);

        System.out.println("Generated Access Token: " + token);
        String  tempname = jwtUtil.extractUsername(token);
        System.out.println("user is : " + tempname);

        return token;
    }

    // Generate Refresh Token and save in database
    public String createRefreshToken(String username) {


        String token = jwtUtil.generateRefreshToken(username);
        Long userId = userService.getUserIdByUsername(username);

        Token tokenEntity = new Token();
        tokenEntity.setUserId(userId);
        tokenEntity.setToken(token);
        tokenEntity.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        tokenEntity.setExpiresAt(new Timestamp(System.currentTimeMillis() + (1000 * 60 * 60 * 24 * 7)));
        tokenEntity.setRevoked(false);


        try {
            tokenRepository.save(tokenEntity);
            System.out.println("Generated Refresh Token: " + token);
            return token;
        }
        catch (Exception e) { e.printStackTrace();throw new RuntimeException("Error saving refresh token to the database."); }


    }

    // Validate Access Token
    public boolean isValidAccessToken(String token) {
        return jwtUtil.validateAccessToken(token);
    }

    // Validate Refresh Token
    public boolean isValidRefreshToken(String token) {
        return jwtUtil.validateRefreshToken(token);
    }

    // Save Refresh Token in Database
    public void saveRefreshToken(Long userId, String refreshToken) {
        Token token = new Token();
        token.setUserId(userId);
        token.setToken(refreshToken);
        token.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        token.setExpiresAt(new Timestamp(System.currentTimeMillis() + (1000 * 60 * 60 * 24 * 7)));  // 7 days expiry
        token.setRevoked(false);  // Initially set to false

        try {
            tokenRepository.save(token);
        } catch (Exception e) {
            // Log error and handle it gracefully
            e.printStackTrace();
            throw new RuntimeException("Error saving refresh token to the database.");
        }
    }

    public Token getRefreshTokenFromDatabase(String refreshToken) {
        return tokenRepository.findByToken(refreshToken).orElse(null);
    }


    public String Return_username(Token token) {
        String temp_username = jwtUtil.extractUsername(token.getToken());

        System.out.println("user is : " + temp_username);
        return temp_username;
    }


    public String extractUsernameFromToken(String token) {
        return jwtUtil.extractUsername(token);
    }

}
