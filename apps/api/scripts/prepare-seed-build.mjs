import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const seedBuildDir = resolve('.seed-build');

await mkdir(seedBuildDir, { recursive: true });
await writeFile(
  resolve(seedBuildDir, 'package.json'),
  `${JSON.stringify({ type: 'module' }, null, 2)}\n`,
);
