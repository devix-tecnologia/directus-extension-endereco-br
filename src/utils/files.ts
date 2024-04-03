import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';


export function readInnerFile(file: string) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    return readFileSync(`${__dirname}/${file}`)
}