
package com.saiparathas.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.saiparathas.backend.entity.MenuItem;
import com.saiparathas.backend.repository.MenuItemRepository;
import com.saiparathas.backend.repository.RestaurantRepository;

@RestController
@RequestMapping("/api/menu-items")
@CrossOrigin(origins = "http://localhost:5173")
public class MenuItemController {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    public MenuItemController(
            MenuItemRepository menuItemRepository,
            RestaurantRepository restaurantRepository
    ) {
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
    }

    // TEMPORARY: Check which database Spring Boot is using
    @GetMapping("/debug/database")
    public ResponseEntity<String> getDatabaseName() {
        return ResponseEntity.ok(
                menuItemRepository.getCurrentDatabaseName()
        );
    }

    // GET available menu items for customers
    @GetMapping("/restaurant/{restaurantId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MenuItem>> getAvailableMenuItems(
            @PathVariable Long restaurantId
    ) {
        return ResponseEntity.ok(
                menuItemRepository.findByRestaurant_IdAndAvailableTrue(
                        restaurantId
                )
        );
    }

    // GET all menu items for the owner panel
    @GetMapping("/restaurant/{restaurantId}/all")
    @Transactional(readOnly = true)
    public ResponseEntity<List<MenuItem>> getAllMenuItems(
            @PathVariable Long restaurantId
    ) {
        return ResponseEntity.ok(
                menuItemRepository.findByRestaurant_Id(restaurantId)
        );
    }

    // CREATE menu item
    @PostMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> createMenuItem(
            @PathVariable Long restaurantId,
            @RequestBody MenuItem menuItem
    ) {
        return restaurantRepository.findById(restaurantId)
                .map(restaurant -> {
                    menuItem.setId(null);
                    menuItem.setRestaurant(restaurant);
                    menuItem.setAvailable(true);

                    MenuItem saved = menuItemRepository.save(menuItem);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // UPDATE menu item
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateMenuItem(
            @PathVariable Long id,
            @RequestBody MenuItem updatedItem
    ) {
        return menuItemRepository.findById(id)
                .map(existingItem -> {
                    if (updatedItem.getName() == null
                            || updatedItem.getName().isBlank()) {
                        return ResponseEntity.badRequest()
                                .body("Item name is required.");
                    }

                    if (updatedItem.getPrice() == null
                            || updatedItem.getPrice() <= 0) {
                        return ResponseEntity.badRequest()
                                .body("Price must be greater than zero.");
                    }

                    existingItem.setName(updatedItem.getName().trim());
                    existingItem.setDescription(
                            updatedItem.getDescription()
                    );
                    existingItem.setPrice(updatedItem.getPrice());
                    existingItem.setImageUrl(updatedItem.getImageUrl());
                    existingItem.setCategory(updatedItem.getCategory());

                    // Preserve availability and restaurant relationship.
                    MenuItem saved = menuItemRepository.save(existingItem);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE menu item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable Long id
    ) {
        if (!menuItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        menuItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ENABLE / DISABLE menu item
    @PatchMapping("/{id}/availability")
    @Transactional
    public ResponseEntity<?> updateAvailability(
            @PathVariable Long id,
            @RequestParam boolean available
    ) {
        return menuItemRepository.findById(id)
                .map(item -> {
                    item.setAvailable(available);
                    return ResponseEntity.ok(
                            menuItemRepository.save(item)
                    );
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
