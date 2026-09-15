package com.erp.backend.repository;

import com.erp.backend.model.GoodsReceiptItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoodsReceiptItemRepository extends JpaRepository<GoodsReceiptItem, Long> {
}