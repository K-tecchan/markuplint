import type { ChildNode, Result } from './types';

import { cmLog } from './debug';

const transparentLog = cmLog.extend('transparent');

export function transparent(nodes: ChildNode[]): Result {
	if (nodes.length === 0 || nodes[0]?.parentElement?.parentElement) {
		transparentLog('Skipped');
		return {
			type: nodes.length === 0 ? 'MATCHED_ZERO' : 'MATCHED',
			matched: nodes.slice(),
			unmatched: [],
			zeroMatch: nodes.length === 0,
			query: 'transparent',
			hint: {},
		};
	}

	transparentLog('Transparent model element is component root');

	return {
		type: 'MATCHED',
		matched: nodes.slice(),
		unmatched: [],
		zeroMatch: false,
		query: 'transparent',
		hint: {},
	};
}
