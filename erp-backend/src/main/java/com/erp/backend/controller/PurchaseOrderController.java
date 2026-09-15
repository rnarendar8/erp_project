package com.erp.backend.controller;

import com.erp.backend.model.PurchaseOrder;
import com.erp.backend.service.PurchaseOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @PostMapping
    public PurchaseOrder createPurchaseOrder(
            @RequestBody PurchaseOrder purchaseOrder) {

        return purchaseOrderService.savePurchaseOrder(purchaseOrder);
    }

    @GetMapping
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderService.getAllPurchaseOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(
            @PathVariable Long id) {

        return purchaseOrderService.getPurchaseOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrder(
            @PathVariable Long id,
            @RequestBody PurchaseOrder purchaseOrder) {

        try {

            return ResponseEntity.ok(
                    purchaseOrderService.updatePurchaseOrder(
                            id,
                            purchaseOrder
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePurchaseOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        try {

            PurchaseOrder updatedOrder =
                    purchaseOrderService.updatePurchaseOrderStatus(
                            id,
                            status
                    );

            return ResponseEntity.ok(updatedOrder);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePurchaseOrder(
            @PathVariable Long id) {

        try {

            purchaseOrderService.deletePurchaseOrder(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}