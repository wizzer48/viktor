import fs from 'fs/promises';
import path from 'path';

async function walk(dir: string): Promise<string[]> {
    let results: string[] = [];
    const list = await fs.readdir(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            results = results.concat(await walk(filePath));
        } else if (filePath.endsWith('.tsx')) {
            results.push(filePath);
        }
    }
    return results;
}

async function patchContrast() {
    const files = await walk('src/app/(admin)/admin');
    let patchedCount = 0;

    for (const file of files) {
        let content = await fs.readFile(file, 'utf-8');
        let modified = false;

        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('text-white')) {
                // Ignore safe buttons
                if (line.includes('bg-[var(--viktor-blue)]') || line.includes('bg-green-600') || line.includes('bg-red-500')) {
                    continue;
                }

                lines[i] = line.replace(/text-white/g, 'text-foreground');
                modified = true;
            }
        }

        if (modified) {
            await fs.writeFile(file, lines.join('\n'));
            patchedCount++;
            console.log(`Patched ${file}`);
        }
    }
    console.log(`Successfully patched ${patchedCount} files.`);
}

patchContrast();
