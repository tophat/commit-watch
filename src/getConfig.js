import minimist from 'minimist'

import getCIVars from './getCIVars'
import ensureValid from './ensureValid'
import { parseConfigFile } from './parseConfigFile'

const SUPPORTED_CONFIGS = [
    'COMMITWATCH_GITHUB_TOKEN',
    'CI_REPO_OWNER',
    'CI_REPO_NAME',
    'CI_COMMIT_SHA',
    'CI_BASE_BRANCH',
    'COMMIT_WATCH_OUTPUT_DIR',
    'COMMIT_WATCH_OUTPUT_FILENAME',
    'VERBOSE',
]

const getCLIArgs = () => minimist(process.argv.slice(2))

export const getBaseConfigs = () => {
    let configs = SUPPORTED_CONFIGS.reduce(
        (acc, nextConfig) => ({
            ...acc,
            [nextConfig]: process.env[nextConfig],
        }),
        {},
    )

    const cliArgs = getCLIArgs()

    if (cliArgs['config-file']) {
        configs = { ...configs, ...parseConfigFile(cliArgs['config-file']) }
    }

    SUPPORTED_CONFIGS.forEach(supportedConfigKey => {
        if (cliArgs[supportedConfigKey]) {
            configs[supportedConfigKey] = cliArgs[supportedConfigKey]
        }
    })

    return configs
}

const getConfig = customConfig => {
    const ciVars = getCIVars(getBaseConfigs())

    const config = {
        baseBranch: ciVars.baseBranch,
        commitSha: ciVars.commitSha,
        githubAccessToken: ciVars.githubAccessToken,
        repoName: ciVars.repoName,
        repoOwner: ciVars.repoOwner,
        ...customConfig,
    }
    ensureValid(config)
    return config
}

export default getConfig
