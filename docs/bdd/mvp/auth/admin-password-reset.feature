@desktop @api @auth @mvp
Feature: Back-office password reset
  As a back-office user
  I want to reset my password
  So that I can recover access if I forget it

  Background:
    Given an active staff user exists with email "staff@solangebernard.com"

  Scenario: Request a password reset
    When I request a password reset for "staff@solangebernard.com"
    Then a password reset token should be created
    And a reset notification should be sent to "staff@solangebernard.com"

  Scenario: Reset password with a valid token
    Given a valid password reset token exists for "staff@solangebernard.com"
    When I submit a new password "NewSecurePass123!" using the valid reset token
    Then the password should be updated
    And all prior authenticated sessions for "staff@solangebernard.com" should be invalidated

  Scenario: Reject reset with an invalid token
    When I submit a new password "NewSecurePass123!" using an invalid reset token
    Then the password should not be updated
    And I should see an invalid or expired token message

  Scenario: Reject weak replacement password
    Given a valid password reset token exists for "staff@solangebernard.com"
    When I submit a new password "123" using the valid reset token
    Then the password should not be updated
    And I should see a password strength validation error
