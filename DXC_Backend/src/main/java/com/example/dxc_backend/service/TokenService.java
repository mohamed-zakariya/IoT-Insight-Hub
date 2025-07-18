package com.example.dxc_backend.service;

import com.example.dxc_backend.exception.TokenStorageException;
import com.example.dxc_backend.model.Token;
import com.example.dxc_backend.repository.TokenRepository;
import com.example.dxc_backend.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
public class TokenService {

    private static final Logger logger = LoggerFactory.getLogger(TokenService.class);

    private final TokenRepository tokenRepository;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public TokenService(TokenRepository tokenRepository, JwtUtil jwtUtil, UserService userService){
        this.tokenRepository = tokenRepository;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    public String createAccessToken(String username) {
        String token = jwtUtil.generateAccessToken(username);
        logger.debug("Generated Access Token for {}: {}", username, token);
        return token;
    }

    public String createRefreshToken(String username) {
        String token = jwtUtil.generateRefreshToken(username);
        Long userId = userService.getUserIdByUsername(username);

        Token tokenEntity = new Token();
        tokenEntity.setUserId(userId);
        tokenEntity.setRefreshToken(token);
        tokenEntity.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        tokenEntity.setExpiresAt(new Timestamp(System.currentTimeMillis() + (1000L * 60 * 60 * 24 * 7))); // 7 days
        tokenEntity.setRevoked(false);

        try {
            tokenRepository.save(tokenEntity);
            logger.debug("Refresh token saved successfully for user ID {}.", userId);
            return token;
        } catch (Exception e) {
            String errMsg = String.format("Failed to save refresh token for user '%s' (ID: %d).", username, userId);
            logger.error(errMsg, e);
            throw new TokenStorageException(errMsg, e);
        }

    }

    public boolean isValidAccessToken(String token) {
        return jwtUtil.validateAccessToken(token);
    }

    public boolean isValidRefreshToken(String token) {
        return jwtUtil.validateRefreshToken(token);
    }

    public void saveRefreshToken(Long userId, String refreshToken) {
        Token token = new Token();
        token.setUserId(userId);
        token.setRefreshToken(refreshToken);
        token.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        token.setExpiresAt(new Timestamp(System.currentTimeMillis() + (1000L * 60 * 60 * 24 * 7)));
        token.setRevoked(false);

        try {
            tokenRepository.save(token);
        } catch (Exception e) {
            logger.error("Error saving refresh token: {}", e.getMessage(), e);
            throw new TokenStorageException("Error saving refresh token to the database.", e);
        }
    }

    public Token getRefreshTokenFromDatabase(String refreshToken) {
        return tokenRepository.findByRefreshToken(refreshToken).orElse(null);
    }

    public String Return_username(Token token) {
        String tempUsername = jwtUtil.extractUsername(token.getRefreshToken());
        logger.debug("Extracted username from token: {}", tempUsername);
        return tempUsername;
    }

    public String extractUsernameFromToken(String token) {
        return jwtUtil.extractUsername(token);
    }
}
