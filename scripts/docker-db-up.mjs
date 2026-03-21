import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envFilePath = resolve('apps/api/.env');
const envFile = readFileSync(envFilePath, 'utf8');
const databaseUrlLine = envFile
  .split(/\r?\n/)
  .map((line) => line.trim())
  .find(
    (line) =>
      line.length > 0 &&
      !line.startsWith('#') &&
      line.startsWith('DATABASE_URL='),
  );

if (!databaseUrlLine) {
  throw new Error(`DATABASE_URL is missing from ${envFilePath}.`);
}

const rawDatabaseUrl = databaseUrlLine.slice('DATABASE_URL='.length).trim();
const databaseUrl = rawDatabaseUrl.replace(/^['"]|['"]$/g, '');
const parsedDatabaseUrl = new URL(databaseUrl);

if (
  parsedDatabaseUrl.protocol !== 'postgresql:' &&
  parsedDatabaseUrl.protocol !== 'postgres:'
) {
  throw new Error('DATABASE_URL must use the PostgreSQL protocol.');
}

if (
  parsedDatabaseUrl.hostname !== 'localhost' &&
  parsedDatabaseUrl.hostname !== '127.0.0.1'
) {
  throw new Error(
    'Docker-backed local Postgres only supports localhost DATABASE_URL values.',
  );
}

const postgresUser = decodeURIComponent(
  parsedDatabaseUrl.username || 'postgres',
);
const postgresPassword = decodeURIComponent(parsedDatabaseUrl.password);
const postgresDatabase = parsedDatabaseUrl.pathname.replace(/^\//, '');
const postgresPort = parsedDatabaseUrl.port || '5432';

if (!postgresDatabase) {
  throw new Error('DATABASE_URL must include a database name.');
}

if (!postgresPassword) {
  throw new Error('DATABASE_URL must include a password for local Docker use.');
}

const dockerEnv = {
  ...process.env,
  SB_POSTGRES_DB: postgresDatabase,
  SB_POSTGRES_PASSWORD: postgresPassword,
  SB_POSTGRES_PORT: postgresPort,
  SB_POSTGRES_USER: postgresUser,
};

function runDockerCommand(args, options = {}) {
  const result = spawnSync('docker', args, {
    cwd: resolve('.'),
    env: dockerEnv,
    stdio: options.captureOutput ? 'pipe' : 'inherit',
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    if (options.captureOutput) {
      if (result.stdout) {
        process.stdout.write(result.stdout);
      }

      if (result.stderr) {
        process.stderr.write(result.stderr);
      }
    }

    process.exit(result.status ?? 1);
  }

  return result;
}

runDockerCommand(['compose', 'up', '-d', '--wait', 'postgres']);

const adminDatabaseUser = 'postgres';
const escapedPasswordLiteral = postgresPassword.replaceAll("'", "''");
const escapedUserIdentifier = postgresUser.replaceAll('"', '""');
const escapedDatabaseLiteral = postgresDatabase.replaceAll("'", "''");

const roleExists = runDockerCommand(
  [
    'compose',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-U',
    adminDatabaseUser,
    '-d',
    'postgres',
    '-tAc',
    `SELECT 1 FROM pg_roles WHERE rolname = '${postgresUser.replaceAll("'", "''")}'`,
  ],
  { captureOutput: true },
).stdout.trim();

if (roleExists === '1') {
  runDockerCommand([
    'compose',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-U',
    adminDatabaseUser,
    '-d',
    'postgres',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    `ALTER ROLE "${escapedUserIdentifier}" WITH LOGIN PASSWORD '${escapedPasswordLiteral}'`,
  ]);
} else {
  runDockerCommand([
    'compose',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-U',
    adminDatabaseUser,
    '-d',
    'postgres',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    `CREATE ROLE "${escapedUserIdentifier}" WITH LOGIN PASSWORD '${escapedPasswordLiteral}'`,
  ]);
}

const databaseExists = runDockerCommand(
  [
    'compose',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-U',
    adminDatabaseUser,
    '-d',
    'postgres',
    '-tAc',
    `SELECT 1 FROM pg_database WHERE datname = '${escapedDatabaseLiteral}'`,
  ],
  { captureOutput: true },
).stdout.trim();

const escapedDatabaseIdentifier = postgresDatabase.replaceAll('"', '""');

if (databaseExists !== '1') {
  runDockerCommand([
    'compose',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-U',
    adminDatabaseUser,
    '-d',
    'postgres',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    `CREATE DATABASE "${escapedDatabaseIdentifier}" OWNER "${escapedUserIdentifier}"`,
  ]);
}

runDockerCommand([
  'compose',
  'exec',
  '-T',
  'postgres',
  'psql',
  '-U',
  adminDatabaseUser,
  '-d',
  'postgres',
  '-v',
  'ON_ERROR_STOP=1',
  '-c',
  `ALTER DATABASE "${escapedDatabaseIdentifier}" OWNER TO "${escapedUserIdentifier}"`,
]);

runDockerCommand([
  'compose',
  'exec',
  '-T',
  'postgres',
  'psql',
  '-U',
  adminDatabaseUser,
  '-d',
  postgresDatabase,
  '-v',
  'ON_ERROR_STOP=1',
  '-c',
  `ALTER SCHEMA public OWNER TO "${escapedUserIdentifier}"; GRANT ALL ON SCHEMA public TO "${escapedUserIdentifier}"`,
]);
