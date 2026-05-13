import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import scss from 'rollup-plugin-scss'
import * as sass from 'sass'

export default {
  input: 'src/index.js',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  plugins: [
    resolve({ extensions: ['.js', '.jsx'] }),
    commonjs(),
    scss({
      fileName: 'hangover.css',
      sass,
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx'],
      exclude: 'node_modules/**',
    }),
  ],
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      exports: 'named',
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
    },
  ],
}
