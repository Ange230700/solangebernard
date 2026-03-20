@web @mobile @orders @mvp
Feature: Customer checks order status
  As a customer
  I want to look up my order status
  So that I know what is happening after I place an order

  Background:
    Given an order "ORD-1001" exists for customer "Awa Konan"
    And order "ORD-1001" is linked to phone number "+2250102030405"

  Scenario: Customer looks up an order with valid details
    When I request the status for order "ORD-1001" using phone number "+2250102030405"
    Then I should see the current order status
    And I should see the ordered item summary

  Scenario: Reject lookup with mismatched phone number
    When I request the status for order "ORD-1001" using phone number "+2259999999999"
    Then I should see an order lookup error
    And no order details should be displayed

  Scenario: Order status reflects latest update
    Given order "ORD-1001" has status "Ready for delivery"
    When I request the status for order "ORD-1001" using phone number "+2250102030405"
    Then I should see the status "Ready for delivery"
