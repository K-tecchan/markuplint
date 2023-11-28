import type { DefaultRules, Langs, RuleSettingMode } from './types';
import type { Config } from '@markuplint/ml-config';
import type { Writable } from 'type-fest';

const extRExp: Record<Langs, `\\.${string}$`> = {
	jsx: '\\.[jt]sx?$',
	vue: '\\.vue$',
	svelte: '\\.svelte$',
	astro: '\\.astro$',
	pug: '\\.pug$',
	php: '\\.php$',
	smarty: '\\.tpl$',
	erb: '\\.erb$',
	ejs: '\\.ejs$',
	mustache: '\\.(mustache|hbs)$',
	nunjucks: '\\.nunjucks$',
	liquid: '\\.liquid$',
};

export const langs: Record<Langs, string> = {
	jsx: 'React (JSX)',
	vue: 'Vue',
	svelte: 'Svelte',
	astro: 'Astro',
	pug: 'Pug',
	php: 'PHP',
	smarty: 'Smarty',
	erb: 'eRuby',
	ejs: 'EJS',
	mustache: 'Mustache/Handlebars',
	nunjucks: 'Nunjucks',
	liquid: 'liquid (Shopify)',
};

export function createConfig(langs: readonly Langs[], mode: RuleSettingMode, defaultRules: DefaultRules): Config {
	let config: Writable<Config> = {};

	const parser: Writable<Config['parser']> = { ...config.parser };
	for (const lang of langs) {
		const ext = extRExp[lang];
		if (!ext) {
			continue;
		}
		// @ts-ignore
		parser[ext] = `@markuplint/${lang}-parser`;

		if (lang === 'vue') {
			config = {
				...config,
				specs: {
					...config.specs,
					'\\.vue$': '@markuplint/vue-spec',
				},
			};
		}
		if (lang === 'jsx') {
			config = {
				...config,
				specs: {
					...config.specs,
					'\\.[jt]sx?$': '@markuplint/react-spec',
				},
			};
		}
	}
	if (Object.keys(parser).length > 0) {
		config.parser = parser;
	}

	const rules: Writable<Config['rules']> = { ...config.rules };
	if (Array.isArray(mode)) {
		const ruleNames = Object.keys(defaultRules);

		for (const ruleName of ruleNames) {
			const rule = defaultRules[ruleName];
			if (!rule) {
				continue;
			}
			if (mode.includes(rule.category)) {
				// @ts-ignore
				rules[ruleName] = rule.defaultValue;
			}
		}
	} else if (mode === 'recommended') {
		config.extends = [...(config.extends ?? []), 'markuplint:recommended'];
	} else {
		const ruleNames = Object.keys(defaultRules);
		for (const ruleName of ruleNames) {
			const rule = defaultRules[ruleName];
			if (!rule) {
				continue;
			}
			// @ts-ignore
			rules[ruleName] = rule.defaultValue;
		}
	}
	if (Object.keys(rules).length > 0) {
		config.rules = rules;
	}

	return config;
}
