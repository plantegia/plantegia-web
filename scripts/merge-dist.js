import { cpSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const marketingDist = join(root, 'marketing', 'dist');
const appDist = join(root, 'dist');
const finalDist = join(root, 'dist-final');

// Clean final dist
if (existsSync(finalDist)) {
  rmSync(finalDist, { recursive: true });
}
mkdirSync(finalDist);

// Copy marketing (Astro) as base - this becomes the root
cpSync(marketingDist, finalDist, { recursive: true });

// Copy React app into /app subfolder
const appSubfolder = join(finalDist, 'app');
mkdirSync(appSubfolder, { recursive: true });
cpSync(appDist, appSubfolder, { recursive: true });

console.log('Merged dist folders:');
console.log(`  - Marketing (Astro) → ${finalDist}/`);
console.log(`  - React App → ${finalDist}/app/`);
