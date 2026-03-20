@web @mobile @catalog @mvp
Feature: View product details and choose a variant
  As a customer
  I want to see product details and available variants
  So that I can choose the right size and color

  Background:
    Given a published product named "Tailored Blazer" exists
    And the product has the following variants:
      | size | color | stock |
      | S    | Black | 3     |
      | M    | Black | 0     |
      | L    | Black | 2     |

  Scenario: View product detail page
    When I open the product detail page for "Tailored Blazer"
    Then I should see the product name "Tailored Blazer"
    And I should see the product gallery
    And I should see the product description
    And I should see the available sizes
    And I should see the available colors

  Scenario: Select an in-stock variant
    When I open the product detail page for "Tailored Blazer"
    And I choose size "S"
    And I choose color "Black"
    Then the selected variant should be marked as available

  Scenario: Out-of-stock variant cannot be ordered
    When I open the product detail page for "Tailored Blazer"
    And I choose size "M"
    And I choose color "Black"
    Then the selected variant should be marked as out of stock
    And the order action should be disabled

  Scenario: Variant stock message updates after selection
    When I open the product detail page for "Tailored Blazer"
    And I choose size "L"
    And I choose color "Black"
    Then I should see that only 2 items remain in stock
