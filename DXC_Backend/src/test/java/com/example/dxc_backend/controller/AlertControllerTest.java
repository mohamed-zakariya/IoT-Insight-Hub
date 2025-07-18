package com.example.dxc_backend.controller;

import com.example.dxc_backend.repository.AlertRepository;
import com.example.dxc_backend.repository.UserRepository;
import com.example.dxc_backend.service.EmailService;
import com.example.dxc_backend.service.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.beans.factory.annotation.Autowired;

@WebMvcTest(controllers = AlertController.class)
@Import(AlertControllerTest.TestMocks.class)
class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @TestConfiguration
    static class TestMocks {
        @Bean
        public AlertRepository alertRepository() {
            return mock(AlertRepository.class);
        }

        @Bean
        public TokenService tokenService() {
            return mock(TokenService.class);
        }

        @Bean
        public UserRepository userRepository() {
            return mock(UserRepository.class);
        }

        @Bean
        public EmailService emailService() {
            return mock(EmailService.class);
        }
    }

    @Autowired
    private TokenService tokenService;

    @Test
    void testUnauthorizedAccess() throws Exception {
        when(tokenService.isValidAccessToken("bad")).thenReturn(false);

        mockMvc.perform(get("/api/alerts").header("accessToken", "bad"))
                .andExpect(status().isUnauthorized());
    }
}
