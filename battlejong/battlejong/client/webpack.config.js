const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {

  mode : "development",

  entry : "./src/code/main.tsx",

  resolve : {
    extensions : [ ".ts", ".tsx", ".js" ]
  },

  module : {
    rules : [
      {
        test: /\.png$/,
        use : { loader : "url-loader", options : { limit : 65536, esModule : false, } }
      },
      {
        test : /\.html$/,
        use : { loader : "html-loader" }
      },
      {
        test : /\.css$/,
        use : [ "style-loader", "css-loader" ]
      },
      {
        test : /\.tsx?$/,
        use : "ts-loader",
        exclude : /node_modules/
      }
    ]

  },

  plugins : [
    new HtmlWebPackPlugin({ template : "./src/index.html", filename : "./index.html" })
  ],

  performance : { hints : false },
  watch : true,
  devtool : "source-map"

};
