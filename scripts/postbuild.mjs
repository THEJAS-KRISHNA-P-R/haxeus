import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

async function runPostbuild() {
    const publicSrc = path.join(rootDir, 'public');
    const publicDest = path.join(standaloneDir, 'public');

    const staticSrc = path.join(rootDir, '.next', 'static');
    const staticDest = path.join(standaloneDir, '.next', 'static');

    console.log('--- Starting Standalone Build Post-processing ---');

    if (!fs.existsSync(standaloneDir)) {
        console.error('Error: .next/standalone directory does not exist. Did the build fail or is "output: standalone" missing from next.config.js?');
        process.exit(1);
    }

    try {
        if (fs.existsSync(publicSrc)) {
            console.log('Copying public folder to standalone...');
            copyRecursiveSync(publicSrc, publicDest);
        }

        if (fs.existsSync(staticSrc)) {
            console.log('Copying .next/static folder to standalone...');
            copyRecursiveSync(staticSrc, staticDest);
        }

        console.log('--- Post-processing completed successfully ---');
    } catch (err) {
        console.error('Error during postbuild:', err);
        process.exit(1);
    }
}

runPostbuild();
