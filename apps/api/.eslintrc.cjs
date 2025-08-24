module.exports = {
  extends: ['../../.eslintrc.cjs'],
  rules: {
    // Disable React rules for Node.js code
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
