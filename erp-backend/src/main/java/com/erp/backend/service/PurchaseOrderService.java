package com.erp.backend.service;

import com.erp.backend.model.Product;
import com.erp.backend.model.PurchaseOrder;
import com.erp.backend.model.PurchaseOrderItem;
import com.erp.backend.model.Supplier;
import com.erp.backend.repository.ProductRepository;
import com.erp.backend.repository.PurchaseOrderRepository;
import com.erp.backend.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            ProductRepository productRepository,
            SupplierRepository supplierRepository) {

        this.purchaseOrderRepository = purchaseOrderRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
    }

    @Transactional
    public PurchaseOrder savePurchaseOrder(PurchaseOrder purchaseOrder) {

        // Generate a unique PO number only when creating a new PO
        if (purchaseOrder.getId() == null) {

            long nextNumber = purchaseOrderRepository.count() + 1;

            String orderNumber;

            do {
                orderNumber = String.format("PO%03d", nextNumber);
                nextNumber++;
            } while (
                    purchaseOrderRepository
                            .findByOrderNumber(orderNumber)
                            .isPresent()
            );

            purchaseOrder.setOrderNumber(orderNumber);

            // Default status
            if (purchaseOrder.getStatus() == null
                    || purchaseOrder.getStatus().isBlank()) {

                purchaseOrder.setStatus("PENDING");
            }
        }

        // Resolve Supplier
        if (purchaseOrder.getSupplier() != null
                && purchaseOrder.getSupplier().getId() != null) {

            Long supplierId = purchaseOrder.getSupplier().getId();

            Supplier supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Supplier not found with id: " + supplierId
                            )
                    );

            purchaseOrder.setSupplier(supplier);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Process Purchase Order Items
        if (purchaseOrder.getItems() != null) {

            for (PurchaseOrderItem item : purchaseOrder.getItems()) {

                item.setPurchaseOrder(purchaseOrder);

                // Resolve Product
                if (item.getProduct() != null
                        && item.getProduct().getId() != null) {

                    Long productId = item.getProduct().getId();

                    Product product = productRepository.findById(productId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found with id: "
                                                    + productId
                                    )
                            );

                    item.setProduct(product);
                }

                // Validate quantity
                if (item.getQuantity() == null
                        || item.getQuantity() <= 0) {

                    throw new RuntimeException(
                            "Quantity must be greater than zero"
                    );
                }

                // Validate unit price
                if (item.getUnitPrice() == null
                        || item.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {

                    throw new RuntimeException(
                            "Unit price cannot be negative"
                    );
                }

                // Calculate item total
                BigDecimal quantity =
                        BigDecimal.valueOf(item.getQuantity());

                BigDecimal unitPrice =
                        item.getUnitPrice();

                BigDecimal totalPrice =
                        quantity.multiply(unitPrice);

                item.setTotalPrice(totalPrice);

                totalAmount = totalAmount.add(totalPrice);
            }
        }

        // Calculate PO total
        purchaseOrder.setTotalAmount(totalAmount);

        return purchaseOrderRepository.save(purchaseOrder);
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public Optional<PurchaseOrder> getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id);
    }

    @Transactional
    public PurchaseOrder updatePurchaseOrder(
            Long id,
            PurchaseOrder purchaseOrder) {

        PurchaseOrder existingOrder =
                purchaseOrderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Order not found with id: " + id
                                )
                        );

        // Only PENDING orders can be edited
        if (!"PENDING".equalsIgnoreCase(existingOrder.getStatus())) {

            throw new RuntimeException(
                    "Only PENDING Purchase Orders can be edited"
            );
        }

        // Preserve existing PO number
        purchaseOrder.setId(id);
        purchaseOrder.setOrderNumber(existingOrder.getOrderNumber());

        return savePurchaseOrder(purchaseOrder);
    }

    @Transactional
    public PurchaseOrder updatePurchaseOrderStatus(
            Long id,
            String newStatus) {

        PurchaseOrder purchaseOrder =
                purchaseOrderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Order not found with id: " + id
                                )
                        );

        String currentStatus = purchaseOrder.getStatus();

        if (currentStatus == null || currentStatus.isBlank()) {
            currentStatus = "PENDING";
            purchaseOrder.setStatus(currentStatus);
        }

        newStatus = newStatus.toUpperCase();

        // PENDING → CONFIRMED
        if ("PENDING".equals(currentStatus)
                && "CONFIRMED".equals(newStatus)) {

            purchaseOrder.setStatus("CONFIRMED");
        }

        // CONFIRMED → RECEIVING
        else if ("CONFIRMED".equals(currentStatus)
                && "RECEIVING".equals(newStatus)) {

            purchaseOrder.setStatus("RECEIVING");
        }

        // RECEIVING → COMPLETED
        else if ("RECEIVING".equals(currentStatus)
                && "COMPLETED".equals(newStatus)) {

            purchaseOrder.setStatus("COMPLETED");
        }

        // PENDING → CANCELLED
        else if ("PENDING".equals(currentStatus)
                && "CANCELLED".equals(newStatus)) {

            purchaseOrder.setStatus("CANCELLED");
        }

        else {

            throw new RuntimeException(
                    "Invalid status transition: "
                            + currentStatus
                            + " → "
                            + newStatus
            );
        }

        return purchaseOrderRepository.save(purchaseOrder);
    }

    public void deletePurchaseOrder(Long id) {

        PurchaseOrder purchaseOrder =
                purchaseOrderRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Order not found with id: " + id
                                )
                        );

        // Only PENDING orders can be deleted
        if (!"PENDING".equalsIgnoreCase(purchaseOrder.getStatus())) {

            throw new RuntimeException(
                    "Only PENDING Purchase Orders can be deleted"
            );
        }

        purchaseOrderRepository.delete(purchaseOrder);
    }
}