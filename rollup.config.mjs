import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/mydash.cjs.js',
      format: 'cjs',
      exports: 'named',
    },
    {
      file: 'dist/mydash.esm.js',
      format: 'esm',
    },
  ],
  plugins: [typescript()]
};
