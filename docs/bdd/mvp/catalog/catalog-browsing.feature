@web @mobile @catalog @mvp
Feature: Browse the public product catalog
  As a customer
  I want to browse published products
  So that I can discover items I may want to order

  Background:
    Given the catalog contains published products
    And draft products are hidden from customers

  @critical
  Scenario: View the catalog landing page
    When I open the public catalog
    Then I should see a list of published products
    And each product should show its name
    And each product should show its main photo
    And each product should show its starting price

  Scenario: Only published products are visible
    Given a product named "Classic Black Dress" is published
    And a product named "Internal Sample Piece" is a draft product
    When I open the public catalog
    Then I should see "Classic Black Dress"
    But I should not see "Internal Sample Piece"

  Scenario: Filter products by category
    Given the catalog contains products in multiple categories
    When I filter the catalog by "Dresses"
    Then I should only see products in the "Dresses" category

  Scenario: Empty state when no products match
    Given the catalog contains no published products in the "Accessories" category
    When I filter the catalog by "Accessories"
    Then I should see an empty state message
    And I should not see any product cards
