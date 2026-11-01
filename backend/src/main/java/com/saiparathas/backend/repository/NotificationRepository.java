
package com.saiparathas.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saiparathas.backend.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByRestaurantIdOrderByCreatedAtDesc(
            Long restaurantId
    );

    List<Notification> findByRestaurantIdAndReadFalseOrderByCreatedAtDesc(
            Long restaurantId
    );
}
