const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
    mode: "production",

    entry: {
        background: "./src/background.ts",
        page: "./src/page.ts",
        popup: "./src/popup.ts"
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts"]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    plugins: [
        new ZipPlugin({
            path: 'zip',
            filename: 'package.zip',
            pathPrefix: '',
            fileOptions: {
                mtime: new Date(),
                mode: 0o100664,
                compress: true,
                forceZip64Format: false,
            },
            zipOptions: {
                forceZip64Format: false,
            },
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(__dirname, 'src', 'manifest.json'),
                    to: path.join(__dirname, 'dist'),
                    transform: (content) => {
                        const manifest = JSON.parse(content.toString("UTF-8"));
                        manifest["$schema"] = undefined;
                        return JSON.stringify(manifest);
                    }
                },
                {
                    from: path.join(__dirname, 'src', '*.html'),
                    to: path.join(__dirname, 'dist', '[name][ext]'),
                },
                {
                    from: path.join(__dirname, 'src', 'assets'),
                    to: path.join(__dirname, 'dist', 'assets', '[name][ext]'),
                }
            ]
        })
    ]
};
