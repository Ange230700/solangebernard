@desktop @api @products @mvp
Feature: Manage products in the back office
  As a staff member
  I want to create and update products
  So that the public catalog stays accurate

  Background:
    Given I am signed in as a staff user

  Scenario: Create a draft product
    When I create a new product with:
      | name        | Linen Two-Piece |
      | category    | Sets            |
      | base price  | 35000           |
      | description | Lightweight set |
    Then the product should be saved as a draft
    And it should not be visible in the public catalog

  Scenario: Add variants to a product
    Given a draft product named "Linen Two-Piece" exists
    When I add the following variants to "Linen Two-Piece":
      | size | color | stock |
      | S    | Beige | 2     |
      | M    | Beige | 4     |
      | L    | Beige | 1     |
    Then the product should contain 3 variants

  Scenario: Publish a complete product
    Given a draft product named "Linen Two-Piece" exists
    And the product has at least one photo
    And the product has at least one variant
    And the product has a price
    When I publish the product
    Then the product status should become "Published"
    And it should appear in the public catalog

  Scenario: Cannot publish an incomplete product
    Given a draft product named "Unfinished Item" exists
    And the product has no variants
    When I try to publish the product
    Then I should see a validation error
    And the product should remain in "Draft" status

  Scenario: Unpublish a product
    Given a published product named "Linen Two-Piece" exists
    When I unpublish the product
    Then the product status should become "Draft"
    And it should not appear in the public catalog
