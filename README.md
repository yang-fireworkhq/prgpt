# prgpt

Automatically generate Pull Request Message using ChatGPT.

## How to use?

Clone the repo

```bash
npm run build && npm install -g .
npx prgpt 
```

### Get OpenAI api key
https://platform.openai.com/account/api-keys

### Configuration (Optional)
you can create `.commitgpt.json` and/or `.commitgpt-template` config files in your project root. 

#### `.commitgpt.json` file
default: 
```json
{
  "model": "text-davinci-003",
  "temperature": 0.5,
  "maxTokens": 2048,
}
```
this file can be used to change the openai model and other parameters.


### `.commitgpt-template` file
default:
```
Help me to draft a Pull Request based on the following diff:
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
```

this file can be used to change the template used to generate the prompt request. you can modify the template to fit your needs.

## How it works

- Runs `git diff master...HEAD`
- Sends the diff to ChatGPT and asks it to suggest pull request messages
- Shows suggestions to the user

## Credits

Some code and approaches were inspired by the awesome projects below:

- https://github.com/acheong08/ChatGPT
- https://github.com/transitive-bullshit/chatgpt-api
- https://github.com/wong2/chat-gpt-google-extension
