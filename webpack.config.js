module.exports = {
  entry: "./src/App.js",
  output: {
    filename: "./public/app.js"
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'jsx-loader'}
    ]
  }
};