@desktop @api @auth @mvp
Feature: Back-office login
  As a back-office user
  I want to sign in securely
  So that I can manage products, inventory, and orders

  Background:
    Given an active admin user exists with email "admin@solangebernard.com"
    And the password for "admin@solangebernard.com" is "SecurePass123!"
    And an active staff user exists with email "staff@solangebernard.com"
    And the password for "staff@solangebernard.com" is "SecurePass123!"

  Scenario: Successful admin login with valid credentials
    When I submit the login form with email "admin@solangebernard.com" and password "SecurePass123!"
    Then I should be authenticated successfully
    And I should receive an authenticated session
    And I should be redirected to the back-office dashboard

  Scenario: Successful staff login with valid credentials
    When I submit the login form with email "staff@solangebernard.com" and password "SecurePass123!"
    Then I should be authenticated successfully
    And I should receive an authenticated session
    And I should be redirected to the back-office dashboard

  Scenario: Login fails with invalid password
    When I submit the login form with email "admin@solangebernard.com" and password "WrongPass999!"
    Then authentication should fail
    And I should see a generic invalid credentials message
    And no authenticated session should be created

  Scenario: Login fails for unknown email
    When I submit the login form with email "unknown@solangebernard.com" and password "SecurePass123!"
    Then authentication should fail
    And I should see a generic invalid credentials message

  Scenario: Disabled back-office user cannot log in
    Given a disabled staff user exists with email "disabled@solangebernard.com"
    And the password for "disabled@solangebernard.com" is "SecurePass123!"
    When I submit the login form with email "disabled@solangebernard.com" and password "SecurePass123!"
    Then authentication should fail
    And I should see an account disabled message

  Scenario: Required fields are validated
    When I submit the login form without an email
    And I submit the login form without a password
    Then I should see validation errors for the missing required fields
