import type { MLNode } from '../node/node';
import type { RuleConfigValue } from '@markuplint/ml-config';

export type Walker<T extends RuleConfigValue, O = null, N = MLNode<T, O>> = (
	node: N,
) => void | Promise<void> | Promise<void>[];

export type SyncWalker<T extends RuleConfigValue, O = null, N = MLNode<T, O>> = (node: N) => void;

export function syncWalk<T extends RuleConfigValue, O = null>(
	nodeList: ReadonlyArray<MLNode<T, O>>,
	walker: SyncWalker<T, O>,
) {
	for (const node of nodeList) {
		if (node.is(node.ELEMENT_NODE) || node.is(node.MARKUPLINT_PREPROCESSOR_BLOCK)) {
			syncWalk(Array.from(node.childNodes), walker);
		}
		walker(node);
	}
}

export function sequentialWalker<T extends RuleConfigValue, O = null, N = MLNode<T, O>>(
	list: ReadonlyArray<N>,
	walker: Walker<T, O, N>,
) {
	if (list.length === 0) {
		return Promise.resolve();
	}

	/**
	 * The following pattern is used to ensure that all rules run sequentially,
	 * no matter it runs asynchronously or synchronously.
	 */
	let _resolve: () => void;
	let _reject: (reason: unknown) => void;

	const promise = new Promise<void>((resolve, reject) => {
		_resolve = resolve;
		_reject = reject;
	});

	const loop = (index = 0) => {
		if (index >= list.length) {
			_resolve();
			return;
		}

		const node = list[index];
		if (!node) {
			_resolve();
			return;
		}

		const result = walker(node);
		if (result instanceof Promise) {
			result.then(() => loop(index + 1)).catch(_reject);
		} else {
			loop(index + 1);
		}
	};

	loop();

	return promise;
}
