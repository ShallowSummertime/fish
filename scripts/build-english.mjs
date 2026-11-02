import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist/english', { recursive: true });
await cp('english', 'dist/english', { recursive: true });
console.log('Built English static app');
