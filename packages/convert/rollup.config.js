import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [sourcemaps()],
  external: ['tslib', '@sjmeverett/clync-define'],
};
