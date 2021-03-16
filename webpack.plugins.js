const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.DefinePlugin({
    'process.env.FLUENTFFMPEG_COV': false,
    'process.env.FFMPEG_PATH': JSON.stringify("./ffmpeg/ffmpeg.exe"),
    'process.env.FFPROBE_PATH': JSON.stringify("./ffmpeg/ffprobe.exe")
  })
];
