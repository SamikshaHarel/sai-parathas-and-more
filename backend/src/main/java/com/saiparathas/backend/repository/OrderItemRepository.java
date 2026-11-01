package com.saiparathas.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.saiparathas.backend.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}