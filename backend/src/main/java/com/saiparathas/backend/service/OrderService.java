

package com.saiparathas.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.saiparathas.backend.entity.MenuItem;
import com.saiparathas.backend.entity.Order;
import com.saiparathas.backend.entity.OrderItem;
import com.saiparathas.backend.entity.Restaurant;
import com.saiparathas.backend.repository.MenuItemRepository;
import com.saiparathas.backend.repository.OrderItemRepository;
import com.saiparathas.backend.repository.OrderRepository;
import com.saiparathas.backend.repository.RestaurantRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            RestaurantRepository restaurantRepository,
            MenuItemRepository menuItemRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @Transactional
    public Order createOrder(
            Long restaurantId,
            String customerName,
            String customerPhone,
            String paymentMethod,
            String orderType,
            String tableNumber,
            String instructions,
            List<OrderRequestItem> items
    ) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException(
                        "Restaurant not found"
                ));

        if (items == null || items.isEmpty()) {
            throw new RuntimeException(
                    "Order must contain at least one item"
            );
        }

        double totalAmount = 0.0;

        for (OrderRequestItem requestItem : items) {

            if (requestItem.getMenuItemId() == null) {
                throw new RuntimeException(
                        "Menu item ID is required"
                );
            }

            if (requestItem.getQuantity() == null
                    || requestItem.getQuantity() <= 0) {

                throw new RuntimeException(
                        "Quantity must be greater than zero"
                );
            }

            MenuItem menuItem = menuItemRepository.findById(
                    requestItem.getMenuItemId()
            ).orElseThrow(() -> new RuntimeException(
                    "Menu item not found: "
                            + requestItem.getMenuItemId()
            ));

            if (!menuItem.isAvailable()) {
                throw new RuntimeException(
                        "Menu item is currently unavailable: "
                                + menuItem.getName()
                );
            }

            if (!menuItem.getRestaurant().getId().equals(restaurantId)) {
                throw new RuntimeException(
                        "Menu item does not belong to this restaurant"
                );
            }

            double itemPrice = menuItem.getPrice();

            totalAmount += itemPrice * requestItem.getQuantity();
        }

        Order order = new Order();

        order.setRestaurant(restaurant);
        order.setCustomerName(customerName);
        order.setCustomerPhone(customerPhone);
        order.setPaymentMethod(paymentMethod);
        order.setOrderType(orderType);
        order.setTableNumber(tableNumber);
        order.setInstructions(instructions);
        order.setStatus("PENDING");
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        for (OrderRequestItem requestItem : items) {

            MenuItem menuItem = menuItemRepository.findById(
                    requestItem.getMenuItemId()
            ).orElseThrow(() -> new RuntimeException(
                    "Menu item not found: "
                            + requestItem.getMenuItemId()
            ));

            OrderItem orderItem = new OrderItem(
                    savedOrder,
                    menuItem,
                    requestItem.getQuantity(),
                    menuItem.getPrice()
            );

            orderItemRepository.save(orderItem);
        }

        return savedOrder;
    }

    public List<Order> getOrdersByRestaurant(Long restaurantId) {

        return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(
                restaurantId
        );
    }

    public Order getOrder(Long orderId) {

        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Order not found"
                ));
    }

    public Order updateOrderStatus(
            Long orderId,
            String status
    ) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Order not found"
                ));

        if (status == null || status.trim().isEmpty()) {
            throw new RuntimeException(
                    "Order status is required"
            );
        }

        String normalizedStatus = status.trim().toUpperCase();

        if (!normalizedStatus.equals("PENDING")
                && !normalizedStatus.equals("ACCEPTED")
                && !normalizedStatus.equals("PREPARING")
                && !normalizedStatus.equals("READY")
                && !normalizedStatus.equals("COMPLETED")
                && !normalizedStatus.equals("CANCELLED")) {

            throw new RuntimeException(
                    "Invalid order status"
            );
        }

        order.setStatus(normalizedStatus);

        return orderRepository.save(order);
    }

    public static class OrderRequestItem {

        private Long menuItemId;
        private Integer quantity;

        public OrderRequestItem() {
        }

        public Long getMenuItemId() {
            return menuItemId;
        }

        public void setMenuItemId(Long menuItemId) {
            this.menuItemId = menuItemId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
