
package com.saiparathas.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saiparathas.backend.entity.User;
import com.saiparathas.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class PasswordController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(
            @RequestBody SetPasswordRequest request,
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(401)
                    .body(Map.of(
                            "message",
                            "You must be logged in."
                    ));
        }

        User user = userRepository
                .findByUsername(authentication.getName())
                .orElseThrow();

        if (!"OWNER".equals(user.getRole())) {

            return ResponseEntity
                    .status(403)
                    .body(Map.of(
                            "message",
                            "Only the restaurant owner can set this password."
                    ));
        }

        if (user.isPasswordSet()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Your password has already been set."
                    ));
        }

        if (request.password() == null ||
                request.password().length() < 8) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Password must contain at least 8 characters."
                    ));
        }

        if (!request.password().equals(request.confirmPassword())) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Passwords do not match."
                    ));
        }

        user.setPassword(
                passwordEncoder.encode(request.password())
        );

        user.setPasswordSet(true);

        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Password set successfully."
                )
        );
    }

    public record SetPasswordRequest(
            String password,
            String confirmPassword
    ) {
    }
}