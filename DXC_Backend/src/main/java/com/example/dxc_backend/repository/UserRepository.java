package com.example.dxc_backend.repository;

import com.example.dxc_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    User findByUsername(String username);

    @Query("SELECT u.email FROM User u")
    List<String> findAllEmails();

    User getUserByUsername(String username);
}
