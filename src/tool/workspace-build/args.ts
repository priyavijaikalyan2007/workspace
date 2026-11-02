// SPDX-FileCopyrightText: 2026 Priya Vijai Kalyan <priyavijai.kalyan2007@proton.me>
// SPDX-FileCopyrightText: 2026 Outcrop Inc
// SPDX-License-Identifier: GPL-3.0-or-later
// Repository: workspace
// File GUID: f7068d75-d69e-496b-b6cc-b62bc01a46d0
// Created: 2026
// COMPONENT: Native workspace tooling
// PURPOSE: Reject unsupported or ambiguous operations before any side effect.
// RELATES: specs/tooling-implementation.md
// FLOW: Validate inputs -> perform bounded local work -> report actual results.

export interface CliOptions
{
    operation: string;
    help: boolean;
    fixture: boolean;
    extension?: string;
    environment: 'dev' | 'prod';
    version?: string;
}

const operations = [
    'build', 'test', 'package', 'clean', 'upload', 'deploy', 'publish', 'smoke', 'release', 'preflight',
];
export const remoteOperations = ['upload', 'deploy', 'publish', 'smoke', 'preflight'];

/** Keep help aligned with the parser so read-only operations never advertise ignored release flags. */
export function commandHelp(operation: string): string
{
    if (operation === 'release')
    {
        return 'Usage: ./release.sh --extension NAME\nRead-only release history. No Google credentials are required.';
    }
    if (remoteOperations.includes(operation))
    {
        const usage = `Usage: ./${operation}.sh --extension NAME --environment dev|prod`;
        const detail = operation === 'preflight'
            ? 'Fresh billing check only. Requires GOOGLE_ACCOUNT and a saved gcloud login.'
            : 'Remote product operations remain unconfigured. A billing check alone does not authorize release.';
        return `${usage}\n${detail}`;
    }
    if (['build', 'package'].includes(operation))
    {
        return `Usage: ./${operation}.sh [--extension NAME | --fixture]` +
            ' [--environment dev|prod] [--version X.Y.Z]\nFixture output is local and cannot be deployed.';
    }
    return `Usage: ./${operation}.sh [--extension NAME]\nProduct adapters remain unconfigured.`;
}

/** Parse the shared command contract without accessing the filesystem. */
export function parseArguments(args: string[]): CliOptions
{
    const [operation, ...remaining] = args;
    if (!operation || !operations.includes(operation))
    {
        throw new Error('ARGUMENT: Unknown operation. Use a root script with --help.');
    }
    const values = collectFlags(remaining);
    const result: CliOptions = { operation, help: values.has('--help'), fixture: values.has('--fixture'),
        environment: readEnvironment(values) };
    if (values.has('--extension'))
    {
        result.extension = values.get('--extension')!;
    }
    if (values.has('--version'))
    {
        result.version = values.get('--version')!;
    }
    validateSelection(result, values);
    return result;
}

function collectFlags(args: string[]): Map<string, string>
{
    const values = new Map<string, string>();
    while (args.length > 0)
    {
        const raw = args.shift()!;
        const flag = raw === '-h' ? '--help' : raw;
        if (values.has(flag) || !['--help', '--fixture', '--extension', '--environment', '--version'].includes(flag))
        {
            throw new Error('ARGUMENT: Unknown or repeated flag. Read --help.');
        }
        const value = ['--help', '--fixture'].includes(flag) ? 'true' : args.shift();
        if (!value || value.startsWith('--'))
        {
            throw new Error('ARGUMENT: A flag value is missing. Read --help.');
        }
        values.set(flag, value);
    }
    return values;
}

function readEnvironment(values: Map<string, string>): 'dev' | 'prod'
{
    const environment = values.get('--environment') ?? 'dev';
    if (environment !== 'dev' && environment !== 'prod')
    {
        throw new Error('ARGUMENT: Environment must be dev or prod.');
    }
    return environment;
}

function validateSelection(options: CliOptions, flags: Map<string, string>): void
{
    if (options.operation === 'release' && !options.help && !options.extension)
    {
        throw new Error('ARGUMENT: Release inspection requires --extension NAME.');
    }
    if ((options.fixture && !['build', 'package'].includes(options.operation)) ||
        (flags.has('--environment') && ['test', 'clean', 'release'].includes(options.operation)))
    {
        throw new Error('ARGUMENT: Selection does not apply to this operation. Read --help.');
    }
    if (options.extension && !/^[a-z][a-z0-9-]*$/.test(options.extension))
    {
        throw new Error('ARGUMENT: Extension must be a registered lowercase name.');
    }
    if (options.fixture && (options.extension || remoteOperations.includes(options.operation)))
    {
        throw new Error('ARGUMENT: Fixture is a local selection and cannot select an extension.');
    }
    if (options.version && !['build', 'package'].includes(options.operation))
    {
        throw new Error('ARGUMENT: Version is supported only for build and package.');
    }
    if (!options.help && remoteOperations.includes(options.operation) &&
        (!options.extension || !flags.has('--environment')))
    {
        throw new Error('ARGUMENT: Remote operations require --extension and --environment.');
    }
}
