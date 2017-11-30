var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: "./demo/app.js",
    output: {
        path: __dirname + "/build",
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },
    externals: {},
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'demo/index.html',
                to: 'index.html'
            },
            {
                from: 'demo/style.css',
                to: 'style.css'
            }
        ])
    ]
}
