
package com.saiparathas.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.saiparathas.backend.entity.Notification;
import com.saiparathas.backend.repository.NotificationRepository;
import com.saiparathas.backend.repository.RestaurantRepository;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final RestaurantRepository restaurantRepository;

    public NotificationController(
            NotificationRepository notificationRepository,
            RestaurantRepository restaurantRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Notification>> getNotifications(
            @PathVariable Long restaurantId
    ) {
        return ResponseEntity.ok(
                notificationRepository
                        .findByRestaurantIdOrderByCreatedAtDesc(
                                restaurantId
                        )
        );
    }

    @GetMapping("/restaurant/{restaurantId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            @PathVariable Long restaurantId
    ) {
        return ResponseEntity.ok(
                notificationRepository
                        .findByRestaurantIdAndReadFalseOrderByCreatedAtDesc(
                                restaurantId
                        )
        );
    }

    @PostMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> createNotification(
            @PathVariable Long restaurantId,
            @RequestBody Notification request
    ) {

        return restaurantRepository.findById(restaurantId)
                .map(restaurant -> {

                    request.setId(null);
                    request.setRestaurant(restaurant);
                    request.setRead(false);

                    Notification saved =
                            notificationRepository.save(request);

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id
    ) {

        return notificationRepository.findById(id)
                .map(notification -> {

                    notification.setRead(true);

                    return ResponseEntity.ok(
                            notificationRepository.save(notification)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id
    ) {

        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        notificationRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
