const {
  override,
  fixBabelImports,
  addLessLoader,
  addWebpackPlugin,
  addWebpackAlias,
  adjustStyleLoaders
} = require('customize-cra');

const path = require('path');
const resolve = (dir) => {
  return path.join(__dirname, '.', dir);
};

const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true
  }),

  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      noIeCompat: true,
      modules: true,
      modifyVars: {
        // '@primary-color': '#1DA57A'
      }
    }
  }),

  addWebpackPlugin(new AntdDayjsWebpackPlugin()),

  addWebpackAlias({
    '@': resolve('src')
  }),

  // 自动引入全局变量，不需要手动在每个less文件添加
  adjustStyleLoaders((rule) => {
    if (rule.test.toString().includes('less')) {
      rule.use.push({
        loader: require.resolve('style-resources-loader'),
        options: {
          patterns: resolve('./src/styles/variables.less')
        }
      });
    }
  })
);
