package com.saiparathas.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saiparathas.backend.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
}