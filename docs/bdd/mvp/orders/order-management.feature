@desktop @api @orders @mvp
Feature: Manage customer orders in the back office
  As a staff member
  I want to review and update orders
  So that fulfillment is tracked clearly

  Background:
    Given I am signed in as a staff user
    And an order "ORD-001" exists with status "Pending confirmation"

  Scenario: Confirm a pending order
    When I mark order "ORD-001" as "Confirmed"
    Then the order status should be "Confirmed"

  Scenario: Mark an order as ready for delivery
    Given order "ORD-001" has status "Confirmed"
    When I mark order "ORD-001" as "Ready for delivery"
    Then the order status should be "Ready for delivery"

  Scenario: Mark an order as delivered
    Given order "ORD-001" has status "Ready for delivery"
    When I mark order "ORD-001" as "Delivered"
    Then the order status should be "Delivered"

  Scenario: Cancel a pending order and restore stock
    Given order "ORD-001" reserves 1 unit of variant "M / Grey" for product "Signature Set"
    When I cancel order "ORD-001" with reason "Customer unreachable"
    Then the order status should be "Cancelled"
    And 1 unit should be restored to the reserved variant stock

  Scenario: Filter orders by status
    Given multiple orders exist in different statuses
    When I filter orders by "Pending confirmation"
    Then I should only see orders with status "Pending confirmation"

  Scenario: Add an internal note to an order
    When I add an internal note "Customer asked for afternoon delivery" to order "ORD-001"
    Then the note should be saved on order "ORD-001"
    And the note should not be visible to the customer
