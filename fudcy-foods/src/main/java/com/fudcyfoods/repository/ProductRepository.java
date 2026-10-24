package com.fudcyfoods.repository;

import com.fudcyfoods.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByListedTrue();

    Optional<Product> findByIdAndListedTrue(Long id);

    List<Product> findByNameIgnoreCase(String name);

    List<Product> findByStockQuantityLessThanEqualAndListedTrue(Integer threshold);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}
