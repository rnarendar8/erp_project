package com.erp.backend.service;

import com.erp.backend.model.GoodsReceipt;
import com.erp.backend.model.GoodsReceiptItem;
import com.erp.backend.model.Product;
import com.erp.backend.model.PurchaseOrder;
import com.erp.backend.repository.GoodsReceiptRepository;
import com.erp.backend.repository.ProductRepository;
import com.erp.backend.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GoodsReceiptService {

    private final GoodsReceiptRepository goodsReceiptRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public GoodsReceiptService(
            GoodsReceiptRepository goodsReceiptRepository,
            ProductRepository productRepository,
            PurchaseOrderRepository purchaseOrderRepository) {

        this.goodsReceiptRepository = goodsReceiptRepository;
        this.productRepository = productRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public GoodsReceipt saveGoodsReceipt(GoodsReceipt goodsReceipt) {

        // Resolve Purchase Order
        if (goodsReceipt.getPurchaseOrder() != null
                && goodsReceipt.getPurchaseOrder().getId() != null) {

            Long purchaseOrderId =
                    goodsReceipt.getPurchaseOrder().getId();

            PurchaseOrder purchaseOrder =
                    purchaseOrderRepository.findById(purchaseOrderId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Purchase Order not found with id: "
                                                    + purchaseOrderId
                                    )
                            );

            goodsReceipt.setPurchaseOrder(purchaseOrder);
        }

        // Process received items
        if (goodsReceipt.getItems() != null) {

            for (GoodsReceiptItem item : goodsReceipt.getItems()) {

                item.setGoodsReceipt(goodsReceipt);

                if (item.getProduct() != null
                        && item.getProduct().getId() != null) {

                    Long productId = item.getProduct().getId();

                    Product product =
                            productRepository.findById(productId)
                                    .orElseThrow(() ->
                                            new RuntimeException(
                                                    "Product not found with id: "
                                                            + productId
                                            )
                                    );

                    // Increase stock
                    int currentStock =
                            product.getStockQuantity() == null
                                    ? 0
                                    : product.getStockQuantity();

                    int receivedQuantity =
                            item.getReceivedQuantity();

                    product.setStockQuantity(
                            currentStock + receivedQuantity
                    );

                    productRepository.save(product);

                    item.setProduct(product);
                }
            }
        }

        return goodsReceiptRepository.save(goodsReceipt);
    }

    public List<GoodsReceipt> getAllGoodsReceipts() {
        return goodsReceiptRepository.findAll();
    }

    public Optional<GoodsReceipt> getGoodsReceiptById(Long id) {
        return goodsReceiptRepository.findById(id);
    }

    public void deleteGoodsReceipt(Long id) {
        goodsReceiptRepository.deleteById(id);
    }
}