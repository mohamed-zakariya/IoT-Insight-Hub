package com.example.dxc_backend.controller;

import com.example.dxc_backend.model.Token;
import com.example.dxc_backend.service.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.beans.factory.annotation.Autowired;

import java.sql.Timestamp;

@WebMvcTest(controllers = AuthController.class)
@Import(AuthControllerTest.MockConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TokenService tokenService;


    @TestConfiguration
    static class MockConfig {
        @Bean
        public TokenService tokenService() {
            return mock(TokenService.class);
        }
    }
    @TestConfiguration
    static class NoSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(AbstractHttpConfigurer::disable) // ✅ updated way
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

            return http.build();
        }
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGenerateAccessToken() throws Exception {
        String username = "testuser";
        when(tokenService.createAccessToken(username)).thenReturn("mock-access-token");

        mockMvc.perform(post("/auth/generate-access-token")
                        .param("username", username))
                .andExpect(status().isOk())
                .andExpect(content().string("mock-access-token"));
    }

    @Test
    void testRefreshToken_ValidToken() throws Exception {
        String refreshToken = "valid-refresh-token";
        String newAccessToken = "new-access-token";

        Token storedToken = new Token();
        storedToken.setRefreshToken(refreshToken);
        storedToken.setUserId(1L);
        storedToken.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        storedToken.setExpiresAt(new Timestamp(System.currentTimeMillis() + 100000));
        storedToken.setRevoked(false);

        when(tokenService.isValidRefreshToken(refreshToken)).thenReturn(true);
        when(tokenService.getRefreshTokenFromDatabase(refreshToken)).thenReturn(storedToken);
        when(tokenService.Return_username(storedToken)).thenReturn("testuser");
        when(tokenService.createAccessToken("testuser")).thenReturn(newAccessToken);

        mockMvc.perform(post("/auth/refresh-token")
                        .param("refreshToken", refreshToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(newAccessToken))
                .andExpect(jsonPath("$.message").value("Token refreshed successfully!"));
    }

    @Test
    void testRefreshToken_Invalid() throws Exception {
        String invalidRefreshToken = "invalid";

        when(tokenService.isValidRefreshToken(invalidRefreshToken)).thenReturn(false);

        mockMvc.perform(post("/auth/refresh-token")
                        .param("refreshToken", invalidRefreshToken))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid or expired refresh token."));
    }
}
