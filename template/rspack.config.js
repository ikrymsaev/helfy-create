const path = require('path');
const { rspack } = require('@rspack/core');
const { helfyRspack } = require('@helfy/helfy/bundler');

const isDev = process.env.NODE_ENV === 'development';

const paths = {
  src: path.resolve(__dirname, 'src'),
  dist: path.resolve(__dirname, 'dist'),
};

module.exports = {
  context: paths.src,
  mode: isDev ? 'development' : 'production',
  entry: './index.ts',
  watchOptions: isDev
    ? { ignored: ['**/node_modules/**', '**/.helfy/**'] }
    : {},
  devServer: {
    hot: true,
    port: 3000,
    static: { directory: paths.src },
    compress: true,
    historyApiFallback: true,
  },
  output: {
    filename: 'bundle.js',
    path: paths.dist,
    publicPath: '/',
    clean: true,
  },
  resolve: helfyRspack({ projectDir: __dirname }),
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './index.html',
      favicon: './assets/logo.svg',
      minify: !isDev,
    }),
    new rspack.CssExtractRspackPlugin({
      filename: `css/${isDev ? '[name]' : '[contenthash:8]_[id]'}.css`,
      ignoreOrder: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        type: 'javascript/auto',
        use: [
          rspack.CssExtractRspackPlugin.loader,
          { loader: 'css-loader', options: { importLoaders: 1 } },
        ],
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
      },
      {
        test: /\.hf$/,
        exclude: /node_modules/,
        use: [
          require.resolve('@helfy/helfy/compiler/helfy-ts-loader'),
          require.resolve('@helfy/helfy/compiler/hf-loader'),
        ],
      },
      {
        test: /\.md$/i,
        use: require.resolve('@helfy/helfy/compiler/md-loader'),
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: require.resolve('@helfy/helfy/compiler/helfy-ts-loader'),
      },
    ],
  },
};
