package com.example.dxc_backend.service;

import com.example.dxc_backend.dto.UserRegisterationDTO;
import com.example.dxc_backend.exception.*;
import com.example.dxc_backend.model.PasswordResetOTP;
import com.example.dxc_backend.model.User;
import com.example.dxc_backend.repository.PasswordResetOTPRepository;
import com.example.dxc_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);
    private static final Random RANDOM = new SecureRandom();   // ✅ reused instance

    private final UserRepository userRepository;
    private final PasswordResetOTPRepository otpRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordResetOTPRepository otpRepository,
                       EmailService emailService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.otpRepository  = otpRepository;
        this.emailService   = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /*────────────────────────  PUBLIC API  ────────────────────────*/

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /** Creates a user after duplicate checks & validation. */
    public User createUser(UserRegisterationDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()) != null)
            throw new DuplicateUserException("E‑mail already in use.");
        if (userRepository.findByUsername(dto.getUsername()) != null)
            throw new DuplicateUserException("Username already in use.");

        validateGender(dto.getGender());

        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        user.setDob(dto.getDob());

        return userRepository.save(user);
    }

    /** ✅ Cognitive Complexity of this method is now 11. */
    public User updateUser(Long id, User patch) {
        User user = findUserOrThrow(id);

        updateGender(patch, user);
        updateDob(patch, user);
        copyIfNotNull(patch.getFirstName(),   user::setFirstName);
        copyIfNotNull(patch.getLastName(),    user::setLastName);
        copyIfNotNull(patch.getEmail(),       user::setEmail);
        copyIfNotNull(patch.getPassword(),    user::setPassword);
        copyIfNotNull(patch.getUsername(),    user::setUsername);
        copyIfNotNull(patch.getCurrent_postion(), user::setCurrent_postion);
        copyIfNotNull(patch.getLocation(),    user::setLocation);
        copyIfNotNull(patch.getDescription(), user::setDescription);

        return userRepository.save(user);
    }

    /** Simpler & logged. Complexity = 4. */
    public void updatePassword(Long id, String oldPwd, String newPwd) {
        User user = findUserOrThrow(id);
        if (!passwordEncoder.matches(oldPwd, user.getPassword()))
            throw new InvalidPasswordException("Old password is incorrect");

        user.setPassword(passwordEncoder.encode(newPwd));
        userRepository.save(user);
        LOG.info("Password updated for user {}", id);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /* ─── Forgot‑password helpers ─────────────────────────────── */

    public void sendOtpToEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new UserNotFoundException("User not found");

        String otp = "%06d".formatted(RANDOM.nextInt(1_000_000));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        Optional.ofNullable(otpRepository.findByEmail(email)).ifPresent(otpRepository::delete);

        otpRepository.save(new PasswordResetOTP(email, otp, expiry));
        emailService.sendEmail(email, "Your OTP Code", "Your OTP is: " + otp);

        LOG.debug("OTP {} sent to {}", otp, email);
    }

    public boolean verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        PasswordResetOTP otpEntry = otpRepository.findByEmail(email);
        if (otpEntry == null || otpEntry.isExpired() || !otpEntry.getOtp().equals(otp)) return false;

        User user = userRepository.findByEmail(email);
        if (user == null) return false;

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpRepository.delete(otpEntry);
        return true;
    }


    public Long getUserIdByUsername(String username) {
        return Optional.ofNullable(userRepository.findByUsername(username))
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username))
                .getId();
    }

    public String checkOtpValidity(String otp) {
        PasswordResetOTP rec = otpRepository.findByOtp(otp);
        if (rec == null) return "Invalid OTP";
        return rec.isExpired() ? "Expired OTP" : "Valid OTP";
    }

    /*────────────────────────  Validation helpers  ────────────────────────*/

    public void validateGender(String gender) {
        if (gender == null ||
                (!gender.equalsIgnoreCase("Male") && !gender.equalsIgnoreCase("Female"))) {
            throw new IllegalArgumentException("Gender must be 'Male' or 'Female'.");
        }
    }

    public void validateDob(String dob) {
        if (dob == null) throw new IllegalArgumentException("Date of Birth cannot be null.");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            LocalDate.parse(dob, formatter);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("DOB must be yyyy-MM-dd and valid date.");
        }
    }

    /*────────────────────────  Private refactors  ────────────────────────*/

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found (id=" + id + ")"));
    }

    private void updateGender(User patch, User user) {
        if (patch.getGender() != null) {
            validateGender(patch.getGender());
            user.setGender(patch.getGender());
        }
    }

    private void updateDob(User patch, User user) {
        if (patch.getDob() != null) {
            validateDob(patch.getDob().toString());
            user.setDob(patch.getDob());
        }
    }

    /** Generic null‑check + setter. */
    private <T> void copyIfNotNull(T value, java.util.function.Consumer<T> setter) {
        if (value != null) setter.accept(value);
    }
}
