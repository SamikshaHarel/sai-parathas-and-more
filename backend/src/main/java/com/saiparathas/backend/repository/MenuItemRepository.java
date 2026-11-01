package com.saiparathas.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.saiparathas.backend.entity.MenuItem;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurant_Id(Long restaurantId);

    List<MenuItem> findByRestaurant_IdAndAvailableTrue(Long restaurantId);

    @Query(value = "SELECT DATABASE()", nativeQuery = true)
    String getCurrentDatabaseName();
}