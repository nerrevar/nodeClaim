module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'comma-dangle': ['warn', {
        'objects': 'always-multiline',
      }
    ],
    'curly': ['warn', 'multi'],
    'prefer-const': 'off',
    'brace-style': ['error', 'stroustrup'],
    'space-unary-ops': [2, {
      'overrides': {
        'typeof': false,
      },
    }],
    'no-return-assign': 'off',
  }
}
