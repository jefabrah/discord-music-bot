var nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: "./src/index.ts",
  output: {
      filename: "./bundle.js",
  },
  target: "node",
  devtool: "source-map",

  resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js",".json"]
  },

  externals: [nodeExternals()],

  module: {
      loaders: [
          { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
          {
            test: /\.json$/, loader: 'json-loader' }
      ],

      preLoaders: [
          { test: /\.js$/, loader: "source-map-loader" }
      ]
  },
};
