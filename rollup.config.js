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
  plugins: [typescript()],
  external: ['tslib'] // 如果你使用了 tslib，可以将其设为外部依赖
};
