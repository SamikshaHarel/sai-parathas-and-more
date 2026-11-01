
package com.saiparathas.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saiparathas.backend.entity.Restaurant;
import com.saiparathas.backend.repository.RestaurantRepository;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {

    private final RestaurantRepository restaurantRepository;

    public RestaurantController(
            RestaurantRepository restaurantRepository
    ) {
        this.restaurantRepository = restaurantRepository;
    }

    // GET all restaurants
    @GetMapping
    public ResponseEntity<List<Restaurant>> getRestaurants() {
        return ResponseEntity.ok(
                restaurantRepository.findAll()
        );
    }

    // GET restaurant by ID
    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurant(
            @PathVariable Long id
    ) {
        return restaurantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE restaurant
    @PostMapping
    public ResponseEntity<Restaurant> createRestaurant(
            @RequestBody Restaurant restaurant
    ) {
        restaurant.setId(null);
        restaurant.setActive(true);

        Restaurant savedRestaurant =
                restaurantRepository.save(restaurant);

        return ResponseEntity.ok(savedRestaurant);
    }

    // UPDATE restaurant
    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(
            @PathVariable Long id,
            @RequestBody Restaurant updatedRestaurant
    ) {
        return restaurantRepository.findById(id)
                .map(existingRestaurant -> {

                    /* ================================
                       RESTAURANT INFORMATION
                    ================================= */

                    existingRestaurant.setName(
                            updatedRestaurant.getName()
                    );

                    existingRestaurant.setTagline(
                            updatedRestaurant.getTagline()
                    );

                    existingRestaurant.setPhone(
                            updatedRestaurant.getPhone()
                    );

                    existingRestaurant.setEmail(
                            updatedRestaurant.getEmail()
                    );

                    existingRestaurant.setAddress(
                            updatedRestaurant.getAddress()
                    );

                    existingRestaurant.setOpeningHours(
                            updatedRestaurant.getOpeningHours()
                    );

                    /* ================================
                       BRANDING
                    ================================= */

                    existingRestaurant.setLogoUrl(
                            updatedRestaurant.getLogoUrl()
                    );

                    /* ================================
                       FOOTER
                    ================================= */

                    existingRestaurant.setFooterDescription(
                            updatedRestaurant.getFooterDescription()
                    );

                    existingRestaurant.setInstagramUrl(
                            updatedRestaurant.getInstagramUrl()
                    );

                    existingRestaurant.setFacebookUrl(
                            updatedRestaurant.getFacebookUrl()
                    );

                    existingRestaurant.setWhatsappUrl(
                            updatedRestaurant.getWhatsappUrl()
                    );

                    existingRestaurant.setActive(
                            updatedRestaurant.isActive()
                    );

                    Restaurant savedRestaurant =
                            restaurantRepository.save(
                                    existingRestaurant
                            );

                    return ResponseEntity.ok(
                            savedRestaurant
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }
}