const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");

const packageJson = require('./../package.json');
const utils = require('./utils.js');

module.exports = (options) => ({
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['node_modules'],
        mainFields: [ 'es2015', 'browser', 'module', 'main'],
        alias: utils.mapTypescriptAliasToWebpackAlias()
    },
    stats: {
        children: false
    },
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    minimize: {
                        caseSensitive: true,
                        removeAttributeQuotes:false,
                        minifyJS:false,
                        minifyCSS:false
                    }
                },
                exclude: utils.root('src/index.html')
            },
            {
                test: /\.(jpe?g|png|gif|svg|woff2?|ttf|eot)$/i,
                loader: 'file-loader',
                options: {
                    digest: 'hex',
                    hash: 'sha512',
                    // For fixing src attr of image
                    // See https://github.com/jhipster/generator-jhipster/issues/11209
                    name: 'content/[hash].[ext]',
                    esModule: false
                }
            },
            {
                test: /manifest.webapp$/,
                loader: 'file-loader',
                options: {
                    name: 'manifest.webapp'
                }
            },
            // Ignore warnings about System.import in Angular
            { test: /[\/\\]@angular[\/\\].+\.js$/, parser: { system: true } },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: `'${options.env}'`,
                BUILD_TIMESTAMP: `'${new Date().getTime()}'`,
                VERSION: `'${packageJson.version}'`,
                DEBUG_INFO_ENABLED: options.env === 'development',
                // The root URL for API calls, ending with a '/' - for example: `"https://www.jhipster.tech:8081/myservice/"`.
                // If this URL is left empty (""), then it will be relative to the current context.
                // If you use an API server, in `prod` mode, you will need to enable CORS
                // (see the `jhipster.cors` common JHipster property in the `application-*.yml` configurations)
                SERVER_API_URL: `''`
            }
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: './node_modules/swagger-ui-dist/*.{js,css,html,png}', to: 'swagger-ui', flatten: true, globOptions: { ignore: ['**/index.html'] }},
                { from: './node_modules/axios/dist/axios.min.js', to: 'swagger-ui' },
                { from: './src/swagger-ui/', to: 'swagger-ui' },
                { from: './src/content/', to: 'content' },
                { from: './src/favicon.ico', to: 'favicon.ico' },
                { from: './src/manifest.webapp', to: 'manifest.webapp' },
                // jhipster-needle-add-assets-to-webpack - JHipster will add/remove third-party resources in this array
                { from: './src/robots.txt', to: 'robots.txt' }
            ],
        }),
        new MergeJsonWebpackPlugin({
            output: {
                groupBy: [
                    { pattern: "./src/i18n/en/*.json", fileName: "./i18n/en.json" }
                    // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array
                ]
            }
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            chunks: ['polyfills', 'main', 'global'],
            chunksSortMode: 'manual',
            inject: 'body',
            base: '/',
        }),
        new AngularCompilerPlugin({
            mainPath: utils.root('src/app/app.main.ts'),
            tsConfigPath: utils.root('tsconfig.app.json'),
            sourceMap: true
        })
    ]
});
