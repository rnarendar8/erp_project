package com.erp.backend.controller;

import com.erp.backend.model.SalesOrder;
import com.erp.backend.service.SalesOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    public SalesOrderController(SalesOrderService salesOrderService) {
        this.salesOrderService = salesOrderService;
    }

    @PostMapping
    public SalesOrder createSalesOrder(
            @RequestBody SalesOrder salesOrder) {

        return salesOrderService.saveSalesOrder(salesOrder);
    }

    @GetMapping
    public List<SalesOrder> getAllSalesOrders() {
        return salesOrderService.getAllSalesOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesOrder> getSalesOrderById(
            @PathVariable Long id) {

        return salesOrderService.getSalesOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SalesOrder> updateSalesOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        try {
            return ResponseEntity.ok(
                    salesOrderService.updateSalesOrderStatus(id, status)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalesOrder(
            @PathVariable Long id) {

        if (salesOrderService.getSalesOrderById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        salesOrderService.deleteSalesOrder(id);

        return ResponseEntity.noContent().build();
    }
}