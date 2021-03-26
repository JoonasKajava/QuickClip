import path from 'path';
import fs from 'fs';

export function tryGetFilePath(folder: string, file: string) {
    let counter = 0;
    const ext = path.extname(file);
    const name = path.basename(file, ext);

    let absPath = (counter: number) => `${path.join(folder, name)}${(counter > 0 ? ` (${counter})` : "") + ext}`;
    try {
        while (fs.existsSync(absPath(counter))) counter++;
    } catch (err) { }

    return absPath(counter);
}