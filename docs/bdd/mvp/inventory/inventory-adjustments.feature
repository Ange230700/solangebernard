@desktop @api @inventory @mvp
Feature: Adjust inventory for product variants
  As a staff member
  I want to update stock levels
  So that the catalog reflects what is actually available

  Background:
    Given I am signed in as a staff user
    And a product named "Cotton Shirt" exists with the following variants:
      | size | color | stock |
      | M    | White | 5     |

  Scenario: Increase stock after receiving new items
    When I add 10 units to the "M / White" variant of "Cotton Shirt"
    Then the stock level should become 15
    And the adjustment should be recorded in inventory history

  Scenario: Decrease stock due to damage or loss
    When I remove 2 units from the "M / White" variant of "Cotton Shirt" with reason "Damaged items"
    Then the stock level should become 3
    And the adjustment should be recorded in inventory history

  Scenario: Prevent negative stock from manual adjustment
    When I try to remove 6 units from the "M / White" variant of "Cotton Shirt"
    Then I should see an insufficient stock error
    And the stock level should remain 5

  Scenario: View inventory history for a variant
    Given inventory adjustments have been recorded for the "M / White" variant of "Cotton Shirt"
    When I open inventory history for the "M / White" variant
    Then I should see the recorded stock adjustments in reverse chronological order
