const path = require('path');
const nodeExternals = require('webpack-node-externals')

const client = { 
    mode: 'development',
    entry: path.resolve(__dirname, 'client/application.js'),
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'client'),
        filename: 'application.packed.js'
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

module.exports = client;