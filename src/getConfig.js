import minimist from 'minimist'

import getCIVars from './getCIVars'
import ensureValid from './ensureValid'
import { parseConfigFile } from './parseConfigFile'

const SUPPORTED_CONFIGS = [
    'GITHUB_TOKEN',
    'CI_REPO_OWNER',
    'CI_REPO_NAME',
    'CI_COMMIT_SHA',
    'CI_BASE_BRANCH',
    'OUTPUT_DIR',
    'OUTPUT_FILENAME',
    'VERBOSE',
]

const SUPPORTED_CONFIGS_ENV_VARS = [
    { envVarName: 'COMMITWATCH_GITHUB_TOKEN', configName: 'GITHUB_TOKEN' },
    { envVarName: 'CI_REPO_OWNER', configName: 'CI_REPO_OWNER' },
    { envVarName: 'CI_REPO_NAME', configName: 'CI_REPO_NAME' },
    { envVarName: 'CI_COMMIT_SHA', configName: 'CI_COMMIT_SHA' },
    { envVarName: 'CI_BASE_BRANCH', configName: 'CI_BASE_BRANCH' },
    { envVarName: 'COMMIT_WATCH_OUTPUT_DIR', configName: 'OUTPUT_DIR' },
    {
        envVarName: 'COMMIT_WATCH_OUTPUT_FILENAME',
        configName: 'OUTPUT_FILENAME',
    },
    { envVarName: 'VERBOSE', configName: 'VERBOSE' },
]

const getCLIArgs = () => minimist(process.argv.slice(2))

export const getBaseConfigs = () => {
    let configs = SUPPORTED_CONFIGS_ENV_VARS.reduce(
        (acc, nextConfig) => ({
            ...acc,
            [nextConfig.configName]: process.env[nextConfig.envVarName],
        }),
        {},
    )

    const cliArgs = getCLIArgs()

    if (cliArgs['config-file']) {
        configs = { ...configs, ...parseConfigFile(cliArgs['config-file']) }
    }

    SUPPORTED_CONFIGS.forEach(supportedConfigKey => {
        const commandLineArgKey = supportedConfigKey
            .toLowerCase()
            .replace('_', '-')

        if (cliArgs[commandLineArgKey]) {
            configs[supportedConfigKey] = cliArgs[commandLineArgKey]
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
