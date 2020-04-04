import lint from '@commitlint/lint'

import getConfig from './getConfig'
import { rules as RULES } from './rules'
import { STATUSES } from './constants'
import GitHubService from './gitHubService'
import getCommitMessages from './getCommitMessages'

const getSingleCommitLintFailedMessage = commitResult =>
    `Fix commit lint errors - "${commitResult.input}"`

const getMultipleCommitLintsFailedMessage = () =>
    'Multiple commit lint errors, run "make lint-commit-messages" locally'

const getCommitLintResults = async () => {
    const messages = await getCommitMessages()
    const lintedMessages = messages.map(m => lint(m, RULES))
    return await Promise.all(lintedMessages).then(reports => reports.flat())
}

const getCommitResults = async () => {
    const githubServicePromises = []
    const config = getConfig()
    const githubService = new GitHubService({
        commitSha: config.commitSha,
        githubAccessToken: config.githubAccessToken,
        repoName: config.repoName,
        repoOwner: config.repoOwner,
    })
    await githubService.start({ message: 'Checking CommitWatch...' })
    const results = await getCommitLintResults()
    let status = STATUSES.PASS
    let failSummary = ''
    const passSummary = 'All commit messages look good!'
    const lintFailures = []
    results.forEach(commitResult => {
        if (!commitResult.valid) {
            lintFailures.push(commitResult)
        }
        if (commitResult.errors.length && status === STATUSES.PASS) {
            const commitWatchMessage = getSingleCommitLintFailedMessage(
                commitResult,
            )
            githubServicePromises.push(
                githubService.fail({
                    message: commitWatchMessage,
                }),
            )
            status = STATUSES.FAIL
            failSummary = `${failSummary}, ${commitWatchMessage}`
        } else if (commitResult.errors.length && status === STATUSES.FAIL) {
            githubServicePromises.pop()
            githubServicePromises.push(
                githubService.fail({
                    message: getMultipleCommitLintsFailedMessage(),
                }),
            )
            const commitWatchMessage = getSingleCommitLintFailedMessage(
                commitResult,
            )
            failSummary = `${failSummary}, ${commitWatchMessage}`
        }
    })
    if (status !== STATUSES.FAIL) {
        githubServicePromises.push(
            githubService.pass({
                message: 'Commit messages look good!',
            }),
        )
    }

    await Promise.all(githubServicePromises)
    return {
        lintFailures,
        status,
        summary: failSummary || passSummary,
    }
}

export default getCommitResults
