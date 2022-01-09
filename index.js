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
  
  let pullRequestTitle = getPullRequestTitle(); // getHeadCommit();
  
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
  
  if (passes === false) {
    let pattern = "^\\[" + jiraProjectKey + "-[0-9]+\\]\\ [^\\ ]";
    let regExp = new RegExp(pattern, caseInsensitiveMode ? "ig" : "g");

    passes = regExp.test(pullRequestTitle);
    if (passes === false) {
	  core.setFailed('Pull Request title does not start with a Jira ticket (i.e. [SYC-123] YourMessage).'); // Commit message...
	}
    core.info("Pull Request title Jira ticket validation passed");
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

function getHeadCommit() {
  let headCommit = github.context.payload.head_commit;
  core.debug(`Head Commit: ${JSON.stringify(github.context.payload.head_commit)}`);
  if (headCommit == undefined || headCommit.message == undefined) {
    throw new Error("This action should only be run with push events");
  }
  return headCommit.message;
}