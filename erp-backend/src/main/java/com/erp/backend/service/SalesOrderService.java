package com.erp.backend.service;

import com.erp.backend.model.Customer;
import com.erp.backend.model.Product;
import com.erp.backend.model.SalesOrder;
import com.erp.backend.model.SalesOrderItem;
import com.erp.backend.repository.CustomerRepository;
import com.erp.backend.repository.ProductRepository;
import com.erp.backend.repository.SalesOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public SalesOrderService(
            SalesOrderRepository salesOrderRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository) {

        this.salesOrderRepository = salesOrderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    public SalesOrder saveSalesOrder(SalesOrder salesOrder) {

        // Resolve Customer
        if (salesOrder.getCustomer() != null
                && salesOrder.getCustomer().getId() != null) {

            Long customerId = salesOrder.getCustomer().getId();

            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Customer not found with id: " + customerId
                            )
                    );

            salesOrder.setCustomer(customer);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        if (salesOrder.getItems() != null) {

            for (SalesOrderItem item : salesOrder.getItems()) {

                item.setSalesOrder(salesOrder);

                // Resolve Product
                if (item.getProduct() != null
                        && item.getProduct().getId() != null) {

                    Long productId = item.getProduct().getId();

                    Product product = productRepository.findById(productId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found with id: " + productId
                                    )
                            );

                    // Check available stock
                    int currentStock = product.getStockQuantity() == null
                            ? 0
                            : product.getStockQuantity();

                    int quantity = item.getQuantity();

                    if (quantity > currentStock) {
                        throw new RuntimeException(
                                "Insufficient stock for product: "
                                        + product.getName()
                                        + ". Available stock: "
                                        + currentStock
                        );
                    }

                    item.setProduct(product);

                    // Reduce stock
                    product.setStockQuantity(currentStock - quantity);

                    productRepository.save(product);
                }

                // Calculate item total
                BigDecimal quantity =
                        BigDecimal.valueOf(item.getQuantity());

                BigDecimal unitPrice = item.getUnitPrice();

                BigDecimal totalPrice =
                        quantity.multiply(unitPrice);

                item.setTotalPrice(totalPrice);

                totalAmount = totalAmount.add(totalPrice);
            }
        }

        salesOrder.setTotalAmount(totalAmount);

        return salesOrderRepository.save(salesOrder);
    }

    public List<SalesOrder> getAllSalesOrders() {
        return salesOrderRepository.findAll();
    }

    public Optional<SalesOrder> getSalesOrderById(Long id) {
        return salesOrderRepository.findById(id);
    }

    public SalesOrder updateSalesOrderStatus(
            Long id,
            String status) {

        SalesOrder salesOrder = salesOrderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Sales Order not found with id: " + id
                        )
                );

        salesOrder.setStatus(status);

        return salesOrderRepository.save(salesOrder);
    }

    public void deleteSalesOrder(Long id) {
        salesOrderRepository.deleteById(id);
    }
}