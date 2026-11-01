
package com.saiparathas.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.saiparathas.backend.entity.Order;
import com.saiparathas.backend.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Order> createOrder(
            @PathVariable Long restaurantId,
            @RequestBody CreateOrderRequest request
    ) {

        Order order = orderService.createOrder(
                restaurantId,
                request.getCustomerName(),
                request.getCustomerPhone(),
                request.getPaymentMethod(),
                request.getOrderType(),
                request.getTableNumber(),
                request.getInstructions(),
                request.getItems()
        );

        return ResponseEntity.ok(order);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Order>> getRestaurantOrders(
            @PathVariable Long restaurantId
    ) {

        return ResponseEntity.ok(
                orderService.getOrdersByRestaurant(restaurantId)
        );
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrder(
            @PathVariable Long orderId
    ) {

        return ResponseEntity.ok(
                orderService.getOrder(orderId)
        );
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(
                        orderId,
                        status
                )
        );
    }

    public static class CreateOrderRequest {

        private String customerName;

        private String customerPhone;

        private String paymentMethod;

        private String orderType;

        private String tableNumber;

        private String instructions;

        private List<OrderService.OrderRequestItem> items;

        public CreateOrderRequest() {
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public String getCustomerPhone() {
            return customerPhone;
        }

        public void setCustomerPhone(String customerPhone) {
            this.customerPhone = customerPhone;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getOrderType() {
            return orderType;
        }

        public void setOrderType(String orderType) {
            this.orderType = orderType;
        }

        public String getTableNumber() {
            return tableNumber;
        }

        public void setTableNumber(String tableNumber) {
            this.tableNumber = tableNumber;
        }

        public String getInstructions() {
            return instructions;
        }

        public void setInstructions(String instructions) {
            this.instructions = instructions;
        }

        public List<OrderService.OrderRequestItem> getItems() {
            return items;
        }

        public void setItems(
                List<OrderService.OrderRequestItem> items
        ) {
            this.items = items;
        }
    }
}

