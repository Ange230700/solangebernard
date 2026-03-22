@api @notifications @mvp
Feature: Queue customer notifications for order status changes
  As the business
  I want customer notifications to be queued when order statuses change
  So that customers are updated after back-office order actions

  Background:
    Given an order "ORD-001" exists for customer "Awa Konan"
    And order "ORD-001" is linked to phone number "+2250102030405"
    And order "ORD-001" has status "Pending confirmation"

  @critical
  Scenario: Queue a customer notification after order confirmation
    When a staff user marks order "ORD-001" as "Confirmed"
    Then the order status should become "Confirmed"
    And a customer notification should be queued for order "ORD-001"

  Scenario: Queue a customer notification when an order is ready for delivery
    Given order "ORD-001" has status "Confirmed"
    When a staff user marks order "ORD-001" as "Ready for delivery"
    Then the order status should become "Ready for delivery"
    And a customer notification should be queued for order "ORD-001"

  Scenario: Queue a customer notification when an order is delivered
    Given order "ORD-001" has status "Ready for delivery"
    When a staff user marks order "ORD-001" as "Delivered"
    Then the order status should become "Delivered"
    And a customer notification should be queued for order "ORD-001"

  Scenario: Queue a customer notification when an order is cancelled
    When a staff user marks order "ORD-001" as "Cancelled"
    Then the order status should become "Cancelled"
    And a customer notification should be queued for order "ORD-001"

  @critical
  Scenario: Notification failure does not roll back an order status update
    Given notification queueing fails for order "ORD-001"
    When a staff user marks order "ORD-001" as "Confirmed"
    Then the order status should become "Confirmed"
    And the notification failure should be recorded for later retry
