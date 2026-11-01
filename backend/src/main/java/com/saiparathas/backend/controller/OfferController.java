
package com.saiparathas.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
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

import com.saiparathas.backend.entity.Notification;
import com.saiparathas.backend.entity.Offer;
import com.saiparathas.backend.repository.NotificationRepository;
import com.saiparathas.backend.repository.OfferRepository;
import com.saiparathas.backend.repository.RestaurantRepository;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "*")
public class OfferController {

    private final OfferRepository offerRepository;
    private final RestaurantRepository restaurantRepository;
    private final NotificationRepository notificationRepository;

    public OfferController(
            OfferRepository offerRepository,
            RestaurantRepository restaurantRepository,
            NotificationRepository notificationRepository
    ) {
        this.offerRepository = offerRepository;
        this.restaurantRepository = restaurantRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Offer>> getRestaurantOffers(
            @PathVariable Long restaurantId
    ) {
        return ResponseEntity.ok(
                offerRepository.findByRestaurantIdOrderByCreatedAtDesc(
                        restaurantId
                )
        );
    }

    @GetMapping("/restaurant/{restaurantId}/active")
    public ResponseEntity<List<Offer>> getActiveOffers(
            @PathVariable Long restaurantId
    ) {
        return ResponseEntity.ok(
                offerRepository
                        .findByRestaurantIdAndActiveTrueOrderByCreatedAtDesc(
                                restaurantId
                        )
        );
    }

    @PostMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> createOffer(
            @PathVariable Long restaurantId,
            @RequestBody Offer request
    ) {
        return restaurantRepository.findById(restaurantId)
                .map(restaurant -> {

                    request.setId(null);
                    request.setRestaurant(restaurant);
                    request.setActive(true);

                    Offer savedOffer =
                            offerRepository.save(request);

                    // Create customer notification
                    Notification notification =
                            new Notification();

                    notification.setRestaurant(restaurant);
                    notification.setOffer(savedOffer);

                    notification.setTitle(
                            "🔥 New Offer Available!"
                    );

                    String notificationMessage;

                    if ("PERCENTAGE".equalsIgnoreCase(
                            savedOffer.getType()
                    )) {

                        notificationMessage =
                                savedOffer.getTitle()
                                + " - "
                                + savedOffer.getDiscount()
                                + "% OFF";

                    } else {

                        notificationMessage =
                                savedOffer.getTitle()
                                + " - ₹"
                                + savedOffer.getDiscount()
                                + " OFF";
                    }

                    if (savedOffer.getMessage() != null
                            && !savedOffer.getMessage().trim().isEmpty()) {

                        notificationMessage =
                                savedOffer.getMessage().trim();
                    }

                    notification.setMessage(
                            notificationMessage
                    );

                    notification.setRead(false);

                    notificationRepository.save(
                            notification
                    );

                    return ResponseEntity.ok(
                            savedOffer
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Offer> updateOffer(
            @PathVariable Long id,
            @RequestBody Offer request
    ) {
        return offerRepository.findById(id)
                .map(existingOffer -> {

                    existingOffer.setTitle(
                            request.getTitle()
                    );

                    existingOffer.setType(
                            request.getType()
                    );

                    existingOffer.setDiscount(
                            request.getDiscount()
                    );

                    existingOffer.setValidFrom(
                            request.getValidFrom()
                    );

                    existingOffer.setValidUntil(
                            request.getValidUntil()
                    );

                    existingOffer.setMessage(
                            request.getMessage()
                    );

                    existingOffer.setActive(
                            request.isActive()
                    );

                    return ResponseEntity.ok(
                            offerRepository.save(
                                    existingOffer
                            )
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<Offer> updateActive(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        return offerRepository.findById(id)
                .map(offer -> {

                    offer.setActive(active);

                    return ResponseEntity.ok(
                            offerRepository.save(offer)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffer(
            @PathVariable Long id
    ) {
        if (!offerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        offerRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}
