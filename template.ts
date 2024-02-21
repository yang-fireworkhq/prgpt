export const defaultPromptTemplate = `Help me to draft a Pull Request based on the following diff:
{{diff}}

current branch name is {{currentBranch}}, if the branch name contain Jira ticket number, please include it to the Jira Link section. 
Only edit the checklist section if you are sure about the changes you made.
** Do not contain other message except the Pull Request content **.

The pull request template is

## Objective

** What is the purpose of this Pull Request? **

## Changes

** What changes are being made? **

## Jira Link

**Add Jira Ticket number to simply connect to the ticket. eg. CMS-###**

## Type of Pull Request

- [ ] Feature
- [ ] Bug Fix
- [ ] Enhancement
- [ ] Refactor

## Checklist

- [ ] If I added new functionality, I added tests covering it.
- [ ] If I fixed a bug, I added a regression test to prevent the bug from silently reappearing again.
- [ ] I checked whether I should update the docs and did so if necessary.
`