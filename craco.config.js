/* craco.config.js */
const path = require(`path`);

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '@Common': path.resolve(__dirname, 'src/components/Common'),
      '@View': path.resolve(__dirname, 'src/components'),
      '@Mock': path.resolve(__dirname, 'src/mocks'),
      '@Context': path.resolve(__dirname, 'src/contexts'),
      '@Util': path.resolve(__dirname, 'src/utils'),
      '@Hook': path.resolve(__dirname, 'src/hooks'),
      '@API': path.resolve(__dirname, 'src/api'),
      '@Assets': path.resolve(__dirname, 'src/assets'),
      '@Pages': path.resolve(__dirname, 'src/Pages'),
    }
  },
};