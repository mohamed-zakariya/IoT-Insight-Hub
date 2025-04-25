package com.example.dxc_backend.service;

import com.example.dxc_backend.model.PasswordResetOTP;
import com.example.dxc_backend.repository.PasswordResetOTPRepository;
import com.example.dxc_backend.model.User;
import com.example.dxc_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetOTPRepository otpRepository;
    @Autowired private EmailService emailService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new IllegalArgumentException("A user with this email already exists.");
        }

        if (userRepository.findByUsername(user.getUsername()) != null) {
            throw new IllegalArgumentException("A user with this name already exists.");
        }

        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (userDetails.getFirstName() != null) user.setFirstName(userDetails.getFirstName());
            if (userDetails.getLastName() != null) user.setLastName(userDetails.getLastName());
            if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
            if (userDetails.getPassword() != null) user.setPassword(userDetails.getPassword());
            if (userDetails.getUsername() != null) user.setUsername(userDetails.getUsername());
            if (userDetails.getAge() != null) user.setAge(userDetails.getAge());
            if (userDetails.getCurrent_postion() != null) user.setCurrent_postion(userDetails.getCurrent_postion());
            if (userDetails.getLocation() != null) user.setLocation(userDetails.getLocation());
            if (userDetails.getDescription() != null) user.setDescription(userDetails.getDescription());

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

    // 🔐 Forgot Password: Send OTP
    public void sendOtpToEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new RuntimeException("User not found");

        String otp = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        PasswordResetOTP existing = otpRepository.findByEmail(email);
        if (existing != null) otpRepository.delete(existing);

        PasswordResetOTP otpRecord = new PasswordResetOTP(email, otp, expiry);
        otpRepository.save(otpRecord);

        emailService.sendEmail(email, "Your OTP Code", "Your OTP is: " + otp);
    }

    // 🔐 Forgot Password: Verify OTP & Reset Password
    public boolean verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        PasswordResetOTP otpRecord = otpRepository.findByEmail(email);
        if (otpRecord == null || !otpRecord.getOtp().equals(otp) || otpRecord.isExpired()) {
            return false;
        }

        User user = userRepository.findByEmail(email);
        if (user == null) return false;

        user.setPassword(newPassword); // you can hash this if needed
        userRepository.save(user);
        otpRepository.delete(otpRecord);
        return true;
    }
    // for the authentaction proiccees we want userid by username

    public Long getUserIdByUsername(String username) {
        // Fetch the user from the repository
        User user = userRepository.findByUsername(username);

        // Check if the user exists
        if (user == null) {
            throw new RuntimeException("User not found with username: " + username);
        }
        // Return the user ID
        return user.getId();
    }




}
