package com.example.dxc_backend.util;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.Date;
import java.security.Key;

@Component
public class JwtUtil {

    private String SECRET_KEY = "your-secure-secret-key-should-be-long-enough";  // Use a better secret key and store it securely
    private String REFRESH_SECRET_KEY = "your-secure-secret-key-should-be-long-enough";  // Another key for refresh token

    // Generate Access Token (JWT)
    public String generateAccessToken(String username) {
        Key key = new SecretKeySpec(SECRET_KEY.getBytes(), SignatureAlgorithm.HS256.getJcaName());
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))  // 1 hour expiry
                .signWith(key)  // Use the generated key
                .compact();
    }

    // Generate Refresh Token (JWT)
    public String generateRefreshToken(String username) {
        Key key = new SecretKeySpec(REFRESH_SECRET_KEY.getBytes(), SignatureAlgorithm.HS256.getJcaName());
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7))  // 7 days expiry
                .signWith(key)  // Use the generated key
                .compact();
    }

    // Validate Access Token
    public boolean validateAccessToken(String token) {
        try {
            Key key = new SecretKeySpec(SECRET_KEY.getBytes(), SignatureAlgorithm.HS256.getJcaName());
            Jwts.parser() // Use the updated parser
                    .setSigningKey(key)  // Set the signing key
                    .build() // Build the parser
                    .parseClaimsJws(token);  // Parse the JWT
            return true;
        } catch (JwtException e) {
            return false;  // Invalid token
        }
    }

    // Validate Refresh Token
    public boolean validateRefreshToken(String token) {
        try {
            Key key = new SecretKeySpec(REFRESH_SECRET_KEY.getBytes(), SignatureAlgorithm.HS256.getJcaName());
            Jwts.parser() // Use the updated parser
                    .setSigningKey(key)  // Set the signing key
                    .build() // Build the parser
                    .parseClaimsJws(token);  // Parse the JWT
            return true;
        } catch (JwtException e) {
            return false;  // Invalid token
        }
    }

    // Extract Username from Token
    public String extractUsername(String token) {
        Key key = new SecretKeySpec(SECRET_KEY.getBytes(), SignatureAlgorithm.HS256.getJcaName());
        return Jwts.parser() // Use the updated parser
                .setSigningKey(key)  // Set the signing key
                .build() // Build the parser
                .parseClaimsJws(token) // Parse the JWT
                .getBody()
                .getSubject();  // Extract the subject (username)
    }
}
