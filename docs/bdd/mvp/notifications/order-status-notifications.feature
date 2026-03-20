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
