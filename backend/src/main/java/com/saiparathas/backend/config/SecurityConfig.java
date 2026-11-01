
package com.saiparathas.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityContextRepository securityContextRepository
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors
                        .configurationSource(corsConfigurationSource())
                )

                .securityContext(context -> context
                        .securityContextRepository(securityContextRepository)
                )

                .authorizeHttpRequests(auth -> auth

                        // ROOT URL
                        .requestMatchers("/").permitAll()

                        // AUTHENTICATION
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/login"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/auth/me"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/logout"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/set-password"
                        ).hasRole("OWNER")

                        // SUPER ADMIN
                        .requestMatchers(
                                "/api/super-admin/**"
                        ).hasRole("SUPER_ADMIN")

                        // TEMPORARY DATABASE DEBUG
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/menu-items/debug/database"
                        ).permitAll()

                        // CUSTOMER MENU - PUBLIC ACCESS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/menu-items/restaurant/**"
                        ).permitAll()

                        // CUSTOMER ORDERS
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/orders/restaurant/*"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/*"
                        ).permitAll()

                        // CUSTOMER OFFERS
                        .requestMatchers(
                                "/api/offers/restaurant/*/active"
                        ).permitAll()

                        // CUSTOMER NOTIFICATIONS
                        .requestMatchers(
                                "/api/notifications/restaurant/*"
                        ).permitAll()

                        .requestMatchers(
                                "/api/notifications/restaurant/*/unread"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/notifications/*/read"
                        ).permitAll()

                        // OWNER ORDERS
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/restaurant/*"
                        ).hasRole("OWNER")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/orders/*/status"
                        ).hasRole("OWNER")

                        // OWNER MENU
                        .requestMatchers(
                                "/api/menu-items/**"
                        ).hasRole("OWNER")

                        // OWNER OFFERS
                        .requestMatchers(
                                "/api/offers/**"
                        ).hasRole("OWNER")

                        // OWNER NOTIFICATIONS
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/notifications/restaurant/*"
                        ).hasRole("OWNER")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/notifications/*"
                        ).hasRole("OWNER")

                        // RESTAURANT
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/restaurants/*"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/restaurants"
                        ).hasRole("SUPER_ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/restaurants"
                        ).hasRole("SUPER_ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/restaurants/*"
                        ).hasRole("OWNER")

                        // ALL OTHER ENDPOINTS REQUIRE LOGIN
                        .anyRequest().authenticated()
                )

                .formLogin(form -> form.disable())

                .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
