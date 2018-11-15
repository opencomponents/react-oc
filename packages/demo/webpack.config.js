const path = require('path');
const nodeExternals = require('webpack-node-externals')

const client = { 
    mode: 'development',
    entry: path.resolve(__dirname, 'babel/application.client.js'),
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname),
        filename: 'application.client.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/, exclude: /node_modules/, use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            }
        ]
    }
};
const server = {
    mode: 'development',
    target: 'node',
    entry: path.resolve(__dirname, 'babel/react.js'),
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname),
        filename: 'react.js',
        library: 'application-react',
        libraryTarget: 'commonjs2'
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.js$/, exclude: /node_modules/, use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { ignoreBrowserslistConfig: true }], 
                            '@babel/preset-react']
                    }
                }
            }
        ]
    }
};

module.exports = [client, server];