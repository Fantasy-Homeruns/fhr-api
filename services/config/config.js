const fs = require('fs');
const path = require('path')

/**
 * Gets the configuration variables for the environment
 *
 * @param {object} input Serverless input values from the command line
 * @throws Error - Missing --env option from cli
 */
function getConfig(input) {
    if (!input.options.env) {
        throw new Error('--env is required.');
    }

    const env = input.options.env;

    if (env === 'prod' || env === 'stage') {
        let file = path.resolve(`../config/${env}.json`);
        return JSON.parse(fs.readFileSync(file));
    }

    let file = path.resolve('../config/default.json');
    let envVars = JSON.parse(fs.readFileSync(file));

    setDatabaseTableSuffix(env, envVars);
    setEnvironmentDomainName(env, envVars);

    return envVars;
}

/**
 * Appends the environment to the table name if not in stage or production.
 *
 * @param {string} env
 * @param {object} envVars
 * @return undefined
 */
function setDatabaseTableSuffix(env, envVars) {
    const suffix = `-${env}`;
    envVars.db.fhr.name += suffix;
}

/**
 * Prefix the domain name with the env name.
 *
 * @param {string} env
 * @param {object} envVars
 */
function setEnvironmentDomainName(env, envVars) {
    const prefix = `${env}.`;
    envVars.api.domainName = prefix + envVars.api.domainName;
}

module.exports = (sls) => {
    return getConfig(sls.processedInput);
}
