package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.Token;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    // You can add custom methods to query tokens if necessary
//    Token findByToken(String token);
    Optional<Token> findByToken(String token);
}
