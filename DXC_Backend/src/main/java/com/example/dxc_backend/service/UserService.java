package com.example.dxc_backend.service;

import ch.qos.logback.classic.encoder.JsonEncoder;
import com.example.dxc_backend.dto.UserRegisterationDTO;
import com.example.dxc_backend.model.PasswordResetOTP;
import com.example.dxc_backend.repository.PasswordResetOTPRepository;
import com.example.dxc_backend.model.User;
import com.example.dxc_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetOTPRepository otpRepository;
    @Autowired private EmailService emailService;
    @Autowired private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User createUser(UserRegisterationDTO userRegisterationDTO) {

        // 1. Check if email is already used
        if (userRepository.findByEmail(userRegisterationDTO.getEmail()) != null) {
            throw new IllegalArgumentException("A user with this email already exists.");
        }

        // 2. Check if username is already taken
        if (userRepository.findByUsername(userRegisterationDTO.getUsername()) != null) {
            throw new IllegalArgumentException("A user with this username already exists.");
        }


        // Validate gender
        validateGender(userRegisterationDTO.getGender());


        String hashedPassword = passwordEncoder.encode(userRegisterationDTO.getPassword());

        User user = new User();
        user.setFirstName(userRegisterationDTO.getFirstName());
        user.setLastName(userRegisterationDTO.getLastName());
        user.setUsername(userRegisterationDTO.getUsername());
        user.setPassword(hashedPassword);
        user.setEmail(userRegisterationDTO.getEmail());
        user.setDob(userRegisterationDTO.getDob());


        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // Validate gender if it's being updated
            if (userDetails.getGender() != null) {
                validateGender(userDetails.getGender());
                user.setGender(userDetails.getGender());
            }

            // Validate date of birth (DOB) if it's being updated
            if (userDetails.getDob() != null) {
                String dobString = userDetails.getDob().toString(); // Convert Date to String
                validateDob(dobString);
                user.setDob(userDetails.getDob());
            }

            // Update other fields
            if (userDetails.getFirstName() != null) user.setFirstName(userDetails.getFirstName());
            if (userDetails.getLastName() != null) user.setLastName(userDetails.getLastName());
            if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
            if (userDetails.getPassword() != null) user.setPassword(userDetails.getPassword());
            if (userDetails.getUsername() != null) user.setUsername(userDetails.getUsername());
            if (userDetails.getCurrent_postion() != null) user.setCurrent_postion(userDetails.getCurrent_postion());
            if (userDetails.getLocation() != null) user.setLocation(userDetails.getLocation());
            if (userDetails.getDescription() != null) user.setDescription(userDetails.getDescription());

            //save this mmm i cant say it
            return userRepository.save(user);
        } else {
            throw new RuntimeException("User not found with ID: " + id);
        }
    }

    public void updatePassword(Long id, String oldPassword, String newPassword) {
        // Get the user from the database
        Optional<User> optionalUser = userRepository.findById(id);

        System.out.println("userrrr"+ optionalUser);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // Compare the old password with the stored hashed password
            if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                // Hash the new password before saving
                String hashedNewPassword = passwordEncoder.encode(newPassword);
                user.setPassword(hashedNewPassword);
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

        String hashedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(hashedPassword); // you can hash this if needed
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


    // In UserService.java

    public String checkOtpValidity(String otp) {
        PasswordResetOTP otpRecord = otpRepository.findByOtp(otp);
        if (otpRecord == null) {
            return "Invalid OTP";
        } else if (otpRecord.isExpired()) {
            return "Expired OTP";
        } else {
            return "Valid OTP";
        }
    }


    // some new validation because its not working in the user Model iam done with shi fr fr 4real 4real i wanted to be a basket nall player what ami doing here

    public void validateGender(String gender) {
        if (gender == null || (!gender.equalsIgnoreCase("Male") && !gender.equalsIgnoreCase("Female"))) {
            throw new IllegalArgumentException("Invalid gender. Allowed values are 'Male' or 'Female'.");
        }
    }


    // Date of Birth (DOB) validation
    public boolean validateDob(String dob) {
        if (dob == null) {
            throw new IllegalArgumentException("Date of Birth cannot be null.");
        }
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        dateFormat.setLenient(false); // Prevent invalid dates like "2022-02-30"
        try {
            dateFormat.parse(dob); // Attempt to parse the date
        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid date format. Expected format is yyyy-MM-dd.");
        }
        return false;
    }



}
