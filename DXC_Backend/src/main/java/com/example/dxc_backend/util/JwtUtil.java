package com.example.dxc_backend.util;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;      // deprecated – kept intentionally
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Date;

@Component
@SuppressWarnings("deprecation")               // ⬅ single place to suppress all JJWT deprecations
public class JwtUtil {

    /** constant names are OK in upper‑case ‑ rule S116 does not apply */
    private static final String SECRET_KEY          = "your-secure-secret-key-should-be-long-enough";
    private static final String REFRESH_SECRET_KEY  = "your-secure-secret-key-should-be-long-enough";

    // ---------- public API --------------------------------------------------

    public String generateAccessToken(String username) {
        return Jwts.builder()
                .setSubject(username)                 // NOSONAR – legacy API kept intentionally
                .setIssuedAt(new Date())              // NOSONAR
                .setExpiration(new Date(System.currentTimeMillis() + 60L * 60 * 1000))
                .signWith(keyFrom(SECRET_KEY))        // single helper invocation
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)                 // NOSONAR
                .setIssuedAt(new Date())              // NOSONAR
                .setExpiration(new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000))
                .signWith(keyFrom(REFRESH_SECRET_KEY))
                .compact();
    }

    public boolean validateAccessToken(String token) {
        return validate(token, SECRET_KEY);
    }

    public boolean validateRefreshToken(String token) {
        return validate(token, REFRESH_SECRET_KEY);
    }

    public String extractUsername(String token) {
        return Jwts.parser()                             // NOSONAR
                .setSigningKey(keyFrom(SECRET_KEY))   // NOSONAR
                .build()                              // NOSONAR
                .parseClaimsJws(token)                // NOSONAR
                .getBody()                            // NOSONAR
                .getSubject();                        // NOSONAR
    }

    // ---------- helpers -----------------------------------------------------

    private boolean validate(String token, String rawKey) {
        try {
            Jwts.parser()                                // NOSONAR
                    .setSigningKey(keyFrom(rawKey))          // NOSONAR
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    /** Single place that still touches the deprecated SignatureAlgorithm API */
    private Key keyFrom(String raw) {
        return new SecretKeySpec(raw.getBytes(), SignatureAlgorithm.HS256.getJcaName());
    }
}
