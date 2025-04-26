package com.example.dxc_backend.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    public void sendEmail(String to, String subject, String content) {
        // For development: just log the email instead of sending
        System.out.printf("Email to %s:\nSubject: %s\nBody: %s\n", to, subject, content);
    }


}
