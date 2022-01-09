const core = require('@actions/core');
const github = require('@actions/github');

try {
  // Inputs defined in action metadata file
  let jiraProjectKey = core.getInput('jira-project-key');
  let noTicketPrefix = core.getInput('no-ticket-prefix');
  const ignoreCase = core.getInput('ignore-case');
  //const verbose = core.getInput('verbose');

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
  
  let pullRequestTitle = getPullRequestTitle();
  
  let caseInsensitiveMode = (ignoreCase === 'true');
  console.log(`Ignore case set to ${caseInsensitiveMode}`);
  
  if (caseInsensitiveMode) {
    pullRequestTitle = pullRequestTitle.toUpperCase();
    jiraProjectKey = jiraProjectKey.toUpperCase();
  }
  
  let passes = false;

  if (noTicketPrefix != null) {
    if (caseInsensitiveMode) {
      noTicketPrefix = noTicketPrefix.toUpperCase();
    }

    if (pullRequestTitle.startsWith('[' + noTicketPrefix + ']') === true) {
      passes = true;
    }
  }
  
  if (passes === false){
    let pattern = "^\\[" + jiraProjectKey + "-[0-9]+\\]\\ [^\\ ]";
    let regExp = caseInsensitiveMode ? new RegExp(concatPattern,"ig") : new RegExp(concatPattern,"g");

    passes = regExp.test(commitName);
    if (passes === false)
      core.setFailed('Invalid pull request prefix!');
  }
} catch (error) {
  core.setFailed(error.message);
}


function getPullRequestTitle() {
  let pullRequest = github.context.payload.pull_request;
  core.debug(`Pull Request: ${JSON.stringify(github.context.payload.pull_request)}`);
  if (pullRequest == undefined || pullRequest.title == undefined) {
    throw new Error("This action should only be run with Pull Request events");
  }
  return pullRequest.title;
}
