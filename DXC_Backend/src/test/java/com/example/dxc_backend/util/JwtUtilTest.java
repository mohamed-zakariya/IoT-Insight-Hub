package com.example.dxc_backend.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private String testUsername = "testuser";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
    }

    @Test
    void generateAccessToken_shouldCreateTokenContainingUsername() {
        String token = jwtUtil.generateAccessToken(testUsername);
        assertThat(token).isNotNull();

        String extractedUsername = jwtUtil.extractUsername(token);
        assertThat(extractedUsername).isEqualTo(testUsername);
    }

    @Test
    void generateRefreshToken_shouldCreateTokenContainingUsername() {
        String token = jwtUtil.generateRefreshToken(testUsername);
        assertThat(token).isNotNull();

        // For refresh token username extraction, the same secret is not used,
        // So here we can only test validate and token presence, or add a method to extract from refresh token
    }

    @Test
    void validateAccessToken_shouldReturnTrueForValidToken() {
        String token = jwtUtil.generateAccessToken(testUsername);
        assertThat(jwtUtil.validateAccessToken(token)).isTrue();
    }

    @Test
    void validateRefreshToken_shouldReturnTrueForValidToken() {
        String refreshToken = jwtUtil.generateRefreshToken(testUsername);
        assertThat(jwtUtil.validateRefreshToken(refreshToken)).isTrue();
    }

    @Test
    void validateAccessToken_shouldReturnFalseForInvalidToken() {
        String invalidToken = "invalid.token.string";
        assertThat(jwtUtil.validateAccessToken(invalidToken)).isFalse();
    }

    @Test
    void validateRefreshToken_shouldReturnFalseForInvalidToken() {
        String invalidToken = "invalid.token.string";
        assertThat(jwtUtil.validateRefreshToken(invalidToken)).isFalse();
    }

    @Test
    void extractUsername_shouldThrowExceptionForInvalidToken() {
        String invalidToken = "invalid.token.string";

        // Use assertThrows to verify exception when parsing invalid token
        assertThatThrownBy(() -> jwtUtil.extractUsername(invalidToken))
                .isInstanceOf(Exception.class);
    }
}
