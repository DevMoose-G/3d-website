// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';

const config = {
    entry: {
        "index":'./index.js',
        "3d-website":"./3d-website.js",
        "css":"./styles.css"
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        open: true,
        host: '10.207.80.189',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
            favicon: "./icons/favicon-32x32.png"
        }),
        new HtmlWebpackPlugin({
            filename: '3d-website.html',
            template: './3d-website.html',
//            publicPath: "/test",
        }),

        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
            {
                test: /\.(glb|gltf)$/,
                type: 'asset/resource'
            },
            {
                test: /\.json$/,
                exclude: /node_modules/,
                type: 'json',
            },
            {
                test: /\.(jpe?g|png|svg|ico)$/,
                use: [{
                    loader: 'file-loader'
                }]
            },
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        
        config.plugins.push(new MiniCssExtractPlugin());
        
        
    } else {
        config.mode = 'development';
    }
    return config;
};
