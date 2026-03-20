@web @mobile @orders @mvp
Feature: Place an order from the catalog
  As a customer
  I want to submit an order for available products
  So that the brand can confirm my purchase manually

  Background:
    Given a published product named "Signature Set" exists
    And the following variant is in stock:
      | size | color | stock |
      | M    | Grey  | 5     |

  @critical
  Scenario: Place an order successfully
    When I open the product detail page for "Signature Set"
    And I choose size "M"
    And I choose color "Grey"
    And I start an order for quantity 1
    And I provide my full name as "Awa Konan"
    And I provide my phone number as "+2250102030405"
    And I provide my delivery area as "Cocody"
    And I provide my delivery address as "Riviera Palmeraie"
    And I submit the order
    Then the order should be created with status "Pending confirmation"
    And stock for that variant should be reduced by 1
    And I should see an order confirmation message

  Scenario: Prevent ordering more than available stock
    When I open the product detail page for "Signature Set"
    And I choose size "M"
    And I choose color "Grey"
    And I start an order for quantity 6
    Then I should see a stock limit error
    And the order should not be created

  Scenario: Customer must provide required contact information
    When I open the product detail page for "Signature Set"
    And I choose size "M"
    And I choose color "Grey"
    And I start an order for quantity 1
    And I leave the full name empty
    And I leave the phone number empty
    And I submit the order
    Then I should see validation errors for the missing required fields
    And the order should not be created
