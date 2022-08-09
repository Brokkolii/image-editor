module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "image-editor.js",
    library: {
      name: "imageEditor",
      type: "umd",
    },
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
};
