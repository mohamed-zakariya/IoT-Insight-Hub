package com.example.dxc_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
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

    public User updateUser(Long id, User userDetails) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // Update only provided fields
            if (userDetails.getFirstName() != null) user.setFirstName(userDetails.getFirstName());
            if (userDetails.getLastName() != null) user.setLastName(userDetails.getLastName());
            if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
            if (userDetails.getPassword() != null) user.setPassword(userDetails.getPassword());
            if (userDetails.getUsername() != null) user.setUsername(userDetails.getUsername());
            if (userDetails.getAge() != null) user.setAge(userDetails.getAge());
            if (userDetails.getCurrent_postion() != null) user.setCurrent_postion(userDetails.getCurrent_postion());
            if (userDetails.getLocation() != null) user.setLocation(userDetails.getLocation());
            if (userDetails.getDesc() != null) user.setDesc(userDetails.getDesc());

            return userRepository.save(user);
        } else {
            throw new RuntimeException("User not found with ID: " + id);
        }
    }

    public void updatePassword(Long id, String oldPassword, String newPassword) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();


            if (user.getPassword().equals(oldPassword)) {

                user.setPassword(newPassword);
                userRepository.save(user);
            } else {
                throw new RuntimeException("Old password is incorrect");
            }
        } else {
            throw new RuntimeException("User not found with ID: " + id);
        }
    }








    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
