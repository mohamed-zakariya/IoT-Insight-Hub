//package com.example.dxc_backend.controller;
//
//import com.example.dxc_backend.model.Settings;
//import com.example.dxc_backend.model.User;
//import com.example.dxc_backend.service.SettingsService;
//import com.example.dxc_backend.service.TokenService;
//import com.example.dxc_backend.repository.UserRepository;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//import org.junit.jupiter.api.extension.ExtendWith;
//
//@ExtendWith(MockitoExtension.class)  // Enable Mockito for this test class
//@WebMvcTest(SettingsController.class) // Test the SettingsController
//public class SettingsControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Mock
//    private SettingsService settingsService;
//
//    @Mock
//    private TokenService tokenService;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @InjectMocks
//    private SettingsController settingsController; // Inject mocked services into the controller
//
//    @Test
//    public void testCreateSetting_Success() throws Exception {
//        Settings setting = new Settings();
//        setting.setType("Air_pollution");
//        setting.setMetric("co");
//        setting.setThresholdValue(22f);
//        setting.setAlertType("ABOVE");
//
//        // Mocking behavior
//        when(tokenService.isValidAccessToken(anyString())).thenReturn(true);
//        when(tokenService.extractUsernameFromToken(anyString())).thenReturn("john");
//        when(userRepository.getUserByUsername("john")).thenReturn(new User());
//        when(settingsService.createSetting(any(), any(), any(), any())).thenReturn(setting);
//
//        String requestJson = """
//            {
//              "type": "Air_pollution",
//              "metric": "co",
//              "thresholdValue": 22.0,
//              "alertType": "ABOVE"
//            }
//        """;
//
//        mockMvc.perform(post("/api/settings")
//                        .header("accessToken", "fake-token")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(requestJson))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.type").value("Air_pollution"))
//                .andExpect(jsonPath("$.metric").value("co"))
//                .andExpect(jsonPath("$.thresholdValue").value(22.0))
//                .andExpect(jsonPath("$.alertType").value("ABOVE"));
//    }
//}
