
package com.saiparathas.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.saiparathas.backend.entity.User;
import com.saiparathas.backend.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createDefaultUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {

            // Create Super Admin if it does not exist
            if (!userRepository.existsByUsername("superadmin")) {

                User superAdmin = new User(
                        "superadmin",
                        passwordEncoder.encode("SuperAdmin@123"),
                        "SUPER_ADMIN"
                );

                superAdmin.setEmail("superadmin@saiparathas.local");
                superAdmin.setPasswordSet(true);

                userRepository.save(superAdmin);

                System.out.println("Super Admin created successfully.");
            } else {
                System.out.println("Super Admin already exists.");
            }

            // Create Owner if it does not exist
            if (!userRepository.existsByUsername("owner")) {

                User owner = new User(
                        "owner",
                        passwordEncoder.encode("Owner@123"),
                        "OWNER"
                );

                owner.setEmail("owner@saiparathas.local");
                owner.setPasswordSet(false);

                userRepository.save(owner);

                System.out.println("Owner created successfully.");
            } else {
                System.out.println("Owner already exists.");
            }
        };
    }
}
