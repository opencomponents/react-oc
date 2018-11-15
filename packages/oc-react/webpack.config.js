const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals')

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'oc-react',
        libraryTarget: 'commonjs2',
    },
    target: 'node',
    externals: [nodeExternals()],
    module: {
        rules: [
            { 
                test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/react']
                }
            }
        ]
    }
}