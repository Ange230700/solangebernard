@api @platform @mvp
Feature: API health endpoint
  As a client application
  I want a health endpoint
  So that I can verify the API is available

  Scenario: Health endpoint returns success
    When a client sends a GET request to "/health"
    Then the response status should be 200
    And the response body should indicate the API is healthy

  Scenario: Health endpoint is publicly accessible
    When an unauthenticated client sends a GET request to "/health"
    Then the response status should be 200
