import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';
import resolve from 'rollup-plugin-node-resolve';
import jsx from 'rollup-plugin-jsx';

const production = process.env.NODE_ENV === 'production';
const dependencies = Object.keys(require('./package').dependencies);

const plugins = [
    resolve({
        extensions: ['.js', '.jsx'],
    }),
    babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
    }),
    jsx({factory: 'React.createElement'})
];

if (production) {
    plugins.push(minify())
}

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'lib/index.js',
            format: 'cjs',
        },
        external: dependencies,
        plugins,
    }
];