var HTMLWebpackPlugin = require('html-webpack-plugin');

var HTMLWebpackConfig = new HTMLWebpackPlugin({
	template: __dirname + '/app/index.html',
	filename: 'index.html',
	inject: 'body'
});

module.exports = {
		entry: __dirname + '/app/index.js',
		mode:"development",
		module: {
			rules: [
				{
					test: /\.js.*$/,
					exclude: /node_modules/,
					loader: 'babel-loader'
				}
			]
		},
		output: {
			filename:'app.js',
			path: __dirname + '/build'
		},
		plugins:[ HTMLWebpackConfig]
};

