import type { MLDocument } from './document.js';
import type { MLNode } from './node.js';
import type { AnyRule } from '@markuplint/ml-config';
import type { Specificity } from '@markuplint/selector';

import { compareSpecificity } from '@markuplint/selector';

import { log as coreLog } from '../../debug.js';

const ruleMapperLog = coreLog.extend('rule-mapper');
const ruleMapperNodeLog = ruleMapperLog.extend('node');
const ruleMapperNodeRuleLog = ruleMapperNodeLog.extend('rule');

type RuleType = 'rules' | 'nodeRules' | 'childNodeRules';

type MappingLayer = {
	readonly from: RuleType;
	readonly specificity: Specificity;
	readonly rule: AnyRule;
};

export class RuleMapper {
	#nodeList: ReadonlyArray<MLNode<any, any>>;
	#ruleMap = new Map<string, Record<string, MappingLayer>>();

	constructor(
		// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
		document: MLDocument<any, any>,
	) {
		this.#nodeList = Object.freeze([document, ...document.nodeList]);
	}

	apply() {
		ruleMapperLog('ruleTree:');

		this.#nodeList.forEach(node => {
			const rules = this.#ruleMap.get(node.uuid);
			if (!rules) {
				return;
			}
			ruleMapperNodeLog('<%s>', node.nodeName);
			Object.keys(rules).forEach(ruleName => {
				const rule = rules[ruleName];
				if (!rule) {
					return;
				}
				node.rules[ruleName] = rule.rule;
				ruleMapperNodeRuleLog('[from: %s(%s)] %s: %o', rule.from, rule.specificity, ruleName, rule.rule);
			});
		});
	}

	set(
		// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
		node: MLNode<any, any>,
		ruleName: string,
		rule: MappingLayer,
	) {
		const rules = this.#ruleMap.get(node.uuid) ?? {};
		const currentRule = rules[ruleName];
		if (currentRule) {
			const order = compareSpecificity(currentRule.specificity, rule.specificity);
			if (order === 1) {
				ruleMapperLog("Don't set %o ([%s] vs [%s])", rule, currentRule.specificity, rule.specificity);
				return;
			}
			ruleMapperLog('Unset %o from %s', currentRule, node);
		}
		rules[ruleName] = rule;
		this.#ruleMap.set(node.uuid, rules);
		ruleMapperLog('Set to %s from %s (%o): %O', node.nodeName, rule.from, rule.specificity, rule.rule);
	}
}
