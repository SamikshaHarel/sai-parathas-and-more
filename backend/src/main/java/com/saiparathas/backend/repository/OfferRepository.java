
package com.saiparathas.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saiparathas.backend.entity.Offer;

public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByRestaurantIdOrderByCreatedAtDesc(
            Long restaurantId
    );

    List<Offer> findByRestaurantIdAndActiveTrueOrderByCreatedAtDesc(
            Long restaurantId
    );
}
