module.exports = {
	"env": {
		"node": true,
		"es2021": true,
		"mocha": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended"
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": 2020,
		"sourceType": "module"
	},
	"plugins": ["@typescript-eslint"],
	rules: {
		quotes: [2, "double"],

	}
};
