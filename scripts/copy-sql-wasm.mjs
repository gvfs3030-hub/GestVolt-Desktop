import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const destinationDir = path.join(root, 'public');
const destination = path.join(destinationDir, 'sql-wasm.wasm');
await mkdir(destinationDir, { recursive: true });
await copyFile(source, destination);
console.log('SQL.js WebAssembly asset copied to public/sql-wasm.wasm');
