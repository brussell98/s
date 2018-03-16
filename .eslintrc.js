module.exports = {
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module'
	},
	env: {
		es6: true,
		node: true
	},
	extends: 'eslint:recommended',
	rules: {
		'no-console': 0,
		'no-control-regex': 0,
		'no-alert': 1,
		'no-else-return': 1,
		'no-redeclare': 2,
		'no-useless-escape': 1,
		'no-inner-declarations': 0,
		'array-bracket-spacing': ['warn', 'never'],
		'brace-style': ['warn', '1tbs', { 'allowSingleLine': true }],
		'no-trailing-spaces': 1,
		'space-before-function-paren': ['warn', 'never'],
		'arrow-spacing': 1,
		'comma-spacing': ['warn', { 'before': false, 'after': true }],
		'indent': ['error', 'tab', { 'SwitchCase': 1 }],
		'arrow-parens': ['warn', 'as-needed']
	}
}

