import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';

export default [
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    pluginJs.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
        },
        rules: {
            // Vue 模板规则 — 适配项目现有风格（Tab 缩进，单行多属性）
            'vue/multi-word-component-names': 'off',
            'vue/no-v-html': 'off',
            'vue/no-template-shadow': 'off',
            'vue/require-default-prop': 'off',
            'vue/require-prop-types': 'off',
            'vue/html-indent': ['warn', 'tab'],
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/html-self-closing': ['warn', {
                html: { void: 'any', normal: 'any', component: 'any' },
                svg: 'any',
                math: 'any',
            }],
            'vue/first-attribute-linebreak': 'off',
            'vue/html-closing-bracket-newline': 'off',

            // JS 规则
            'no-console': 'warn',
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_|^e$|^err$|^error$',
                destructuredArrayIgnorePattern: '^_',
            }],
            'no-param-reassign': 'off',
            'no-plusplus': 'off',
            'no-shadow': 'off',
            'no-underscore-dangle': 'off',
            'no-useless-escape': 'off',
            'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
            'consistent-return': 'off',
            'prefer-rest-params': 'off',
        },
    },
];
