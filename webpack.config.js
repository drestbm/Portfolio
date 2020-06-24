const path = require('path')
const fs = require('fs')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isDev =  process.env.NODE_ENV === 'development'
const isProd =  process.env.NODE_ENV === 'production'

const PATHS = {
    src: path.join(__dirname, 'src'),
    dist: path.join(__dirname, 'dist'),
    assets: path.join(__dirname, 'src', 'assets'),
}

const PAGES_DIR = path.join(`${PATHS.src}`, 'pug', 'pages')
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }

    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetsPlugin(),
            new TerserPlugin
        ]
    }

    return config
}

module.exports = {
    externals: {
        paths: PATHS
    },
    context: `${PATHS.src}`,
    mode: 'development',
    entry: './js/index.js',
    output: {
        filename: '[name].[hash].js',
        path: `${PATHS.dist}`,
    },
    resolve: {
        extensions: ['.js', '.css', '.png', '.svg', '.jpg'],
        alias: {
            '@': `${PATHS.src}`,
            '@styles': path.join(`${PATHS.src}`, 'styles'),
            '@assets': `${PATHS.assets}`,
        }
    },
    optimization: optimization(),
    devServer: {
        port: 3400,
        hot: isDev,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'src/assets'),
                to:  path.resolve(__dirname, 'dist'),
            }
        ]),
        new MiniCSSExtractPlugin({
            filename: '[name].[hash].css',
        }),
        ...PAGES.map(page => new HTMLWebpackPlugin({
            template: path.join(`${PAGES_DIR}`, `${page}`),
            filename: `./${page.replace(/\.pug/,'.html')}`
        }))
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCSSExtractPlugin.loader,
                        options: {
                            hmr: isDev,
                            reloadAll: true
                        }
                    },
                    'css-loader'
                ]
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    {
                        loader: MiniCSSExtractPlugin.loader,
                        options: {
                            hmr: isDev,
                            reloadAll: true
                        }
                    },
                    'css-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.pug$/,
                loader: 'pug-loader'
            },
            {
                test: /\.(png|jpg|svg)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                use: ['file-loader']
            },
        ]
    }
}