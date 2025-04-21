package com.example.dxc_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    public User saveUser(User user) {
        return userRepository.save(user);
    }


    public User createUser(User user) {
        // Check if a user with the same email exists
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new IllegalArgumentException("A user with this email already exists.");
        }

        // Check if a user with the same name exists
        if (userRepository.findByUsername(user.getFirstName()) != null) {
            throw new IllegalArgumentException("A user with this name already exists.");
        }

        // Save and return the user
        return userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
