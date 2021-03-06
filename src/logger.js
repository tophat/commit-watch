import chalk from 'chalk'

import { getBaseConfigs } from './getConfig'

const stdout = console.log // eslint-disable-line no-console
const stderr = console.error // eslint-disable-line no-console

const debug = error => {
    if (process.env.DEBUG) {
        const debugObject = error.response
            ? error.response.data
            : error.response
        stdout(chalk.greenBright(`[DEBUG] ${error.message}`))
        stderr(error)
        try {
            stderr(JSON.stringify(debugObject, undefined, 2))
        } catch (e) {
            // eat it
        }
    }
}

const log = message => {
    stdout(message)
}

const info = message => {
    if (getBaseConfigs().VERBOSE === '1') {
        stdout(`[INFO] ${message}`)
    }
}

const warn = message => {
    stdout(chalk.yellow(`[WARNING] ${message}`))
}

const error = (messsage, errorStack) => {
    if (errorStack) {
        stdout(errorStack)
    }
    stderr(chalk.red(`[ERROR] ${messsage}`))
}

const fatal = (messsage, errorStack) => {
    if (errorStack) {
        stdout(errorStack)
    }
    stderr(chalk.black.bgRed(`[FATAL] ${messsage}`))
}

const logger = {
    debug,
    error,
    fatal,
    info,
    log,
    warn,
}

export default logger
