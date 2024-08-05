/* eslint-disable @typescript-eslint/no-require-imports,no-param-reassign */

const CompressionPlugin = require('compression-webpack-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')

module.exports = {
  lintOnSave: false,

  devServer: {
    proxy: 'http://localhost:5000'
  },

  chainWebpack: config => {
    if (process.env.NODE_ENV === 'development') {
      // safari dev fix: https://github.com/vuejs/vue-cli/issues/1132
      config.output.filename('[name].[hash].js').end()
    } else if (process.env.NODE_ENV === 'test') {
      // mochapack fix: https://github.com/vuejs/vue-cli/issues/4053
      const scssRule = config.module.rule('scss')
      scssRule.uses.clear()
      scssRule.use('null-loader').loader('null-loader')
    }

    // allow BootstrapVue components to transform URLs for Webpack
    config.module.
      rule('vue').
      use('vue-loader').
      loader('vue-loader').
      tap(options => {
        options.transformAssetUrls = {
          img: 'src',
          image: 'xlink:href',
          'b-avatar': 'src',
          'b-img': 'src',
          'b-img-lazy': ['src', 'blank-src'],
          'b-card': 'img-src',
          'b-card-img': 'src',
          'b-card-img-lazy': ['src', 'blank-src'],
          'b-carousel-slide': 'img-src',
          'b-embed': 'src'
        }

        return options
      })

    // speed up first load
    config.plugins.delete('prefetch')
    config.plugin('CompressionPlugin').use(CompressionPlugin)
  },

  configureWebpack: {
    plugins: [
      new StyleLintPlugin({
        files: ['src/**/*.{vue,scss}']
      })
    ],
    devtool: 'source-map' // fix for stack overflow in source-map-support
  }
}
