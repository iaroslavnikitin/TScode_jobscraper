# features/dice_search.feature
Feature: Job Search on Dice

  Scenario: Search for QA jobs
    Given I set up job search parameters for "Dice"
    When I search for jobs on Dice
    Then I should get job listings saved to CSV