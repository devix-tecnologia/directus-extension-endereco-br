import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/services/', 'src/utils/', 'src/tests/'],
  format: ['esm'],
  dts: true,
  external: [
    '@napi-rs/snappy-darwin-arm64',
    '@napi-rs/snappy-linux-x64',
    '@napi-rs/snappy-win32-x64',
    '@napi-rs/snappy-linux-arm64',
    '@napi-rs/snappy-win32-ia32',
    '@napi-rs/snappy-linux-arm',
    '@napi-rs/snappy',
    'sharp',
    'bufferutil',
    'utf-8-validate'
  ]
});