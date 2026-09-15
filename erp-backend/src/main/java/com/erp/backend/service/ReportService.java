package com.erp.backend.service;

import com.erp.backend.model.Product;
import com.erp.backend.repository.GoodsReceiptRepository;
import com.erp.backend.repository.InvoiceRepository;
import com.erp.backend.repository.ProductRepository;
import com.erp.backend.repository.PurchaseOrderRepository;
import com.erp.backend.repository.SalesOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final ProductRepository productRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final InvoiceRepository invoiceRepository;

    public ReportService(
            ProductRepository productRepository,
            SalesOrderRepository salesOrderRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            GoodsReceiptRepository goodsReceiptRepository,
            InvoiceRepository invoiceRepository) {

        this.productRepository = productRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.goodsReceiptRepository = goodsReceiptRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public Map<String, Object> getOverviewReport() {

        List<Product> products = productRepository.findAll();

        int totalProducts = products.size();

        int totalStock = products.stream()
                .mapToInt(product ->
                        product.getStockQuantity() == null
                                ? 0
                                : product.getStockQuantity())
                .sum();

        BigDecimal totalProductValue = products.stream()
                .map(product -> {

                    BigDecimal price = product.getPrice() == null
                            ? BigDecimal.ZERO
                            : product.getPrice();

                    int quantity = product.getStockQuantity() == null
                            ? 0
                            : product.getStockQuantity();

                    return price.multiply(
                            BigDecimal.valueOf(quantity)
                    );
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalSalesOrders =
                salesOrderRepository.count();

        long totalPurchaseOrders =
                purchaseOrderRepository.count();

        long totalGoodsReceipts =
                goodsReceiptRepository.count();

        long totalInvoices =
                invoiceRepository.count();

        Map<String, Object> report = new LinkedHashMap<>();

        report.put("totalProducts", totalProducts);
        report.put("totalStock", totalStock);
        report.put("totalProductValue", totalProductValue);
        report.put("totalSalesOrders", totalSalesOrders);
        report.put("totalPurchaseOrders", totalPurchaseOrders);
        report.put("totalGoodsReceipts", totalGoodsReceipts);
        report.put("totalInvoices", totalInvoices);

        return report;
    }

    public List<Product> getLowStockReport() {

        return productRepository.findAll()
                .stream()
                .filter(product ->
                        product.getStockQuantity() != null
                                && product.getReorderLevel() != null
                                && product.getStockQuantity()
                                <= product.getReorderLevel())
                .toList();
    }
}