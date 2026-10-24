package com.fudcyfoods.repository;

import com.fudcyfoods.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<CustomerOrder> findByEmailIgnoreCaseAndCustomerIdIsNullOrderByCreatedAtDesc(String email);

    Optional<CustomerOrder> findByIdAndPhone(Long id, String phone);

    List<CustomerOrder> findAllByOrderByCreatedAtDesc();

    List<CustomerOrder> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT o FROM CustomerOrder o WHERE (:status IS NULL OR o.status = :status) ORDER BY o.createdAt DESC")
    List<CustomerOrder> findByStatusFiltered(@Param("status") String status);

    @Query("SELECT o FROM CustomerOrder o WHERE (o.customerId = :customerId OR (o.customerId IS NULL AND LOWER(o.email) = LOWER(:email))) ORDER BY o.createdAt DESC")
    List<CustomerOrder> findAllByCustomerOrEmail(@Param("customerId") Long customerId, @Param("email") String email);
}
