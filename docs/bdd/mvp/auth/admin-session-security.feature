@desktop @api @auth @mvp
Feature: Back-office session security
  As a back-office user
  I want my authenticated session to be protected
  So that unauthorized users cannot access the back office

  Background:
    Given an active staff user exists with email "staff@solangebernard.com"
    And the password for "staff@solangebernard.com" is "SecurePass123!"
    And I am authenticated as "staff@solangebernard.com"

  Scenario: Authenticated user can access a protected route
    When I request the protected route "/admin/orders"
    Then the response status should be 200

  Scenario: Unauthenticated user cannot access a protected route
    Given I am not authenticated
    When I request the protected route "/admin/orders"
    Then the response status should be 401

  Scenario: User can log out
    When I log out
    Then my authenticated session should be destroyed
    And a subsequent request to "/admin/orders" should return 401

  Scenario: Expired session is rejected
    Given my authenticated session has expired
    When I request the protected route "/admin/orders"
    Then the response status should be 401
    And I should be prompted to log in again
