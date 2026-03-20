@desktop @api @auth @authorization @mvp
Feature: Role-based back-office authorization
  As the business
  I want back-office actions to respect user roles
  So that sensitive operations remain restricted

  Background:
    Given an active admin user exists with email "admin@solangebernard.com"
    And an active staff user exists with email "staff@solangebernard.com"

  Scenario: Staff user can manage products
    Given I am authenticated as "staff@solangebernard.com"
    When I request the protected route "/admin/products"
    Then the response status should be 200

  Scenario: Staff user can manage orders
    Given I am authenticated as "staff@solangebernard.com"
    When I request the protected route "/admin/orders"
    Then the response status should be 200

  Scenario: Staff user can manage inventory
    Given I am authenticated as "staff@solangebernard.com"
    When I request the protected route "/admin/inventory"
    Then the response status should be 200

  Scenario: Staff user cannot manage users
    Given I am authenticated as "staff@solangebernard.com"
    When I request the protected route "/admin/users"
    Then the response status should be 403

  Scenario: Admin user inherits staff permissions
    Given I am authenticated as "admin@solangebernard.com"
    When I request the protected route "/admin/products"
    Then the response status should be 200

  Scenario: Admin user can manage users
    Given I am authenticated as "admin@solangebernard.com"
    When I request the protected route "/admin/users"
    Then the response status should be 200
