import type { SvelteNode } from './svelte-parser/index.js';
import type { MLASTNode, Parse } from '@markuplint/ml-ast';

import { flattenNodes, ParserError, ignoreBlock, restoreNode } from '@markuplint/parser-utils';

import svelteParse from './svelte-parser/index.js';
import { traverse } from './traverse.js';

export const parse: Parse = (rawCode, options) => {
	const blocks = ignoreBlock(
		rawCode,
		[
			{
				type: 'Script',
				start: /<script/,
				end: /<\/script>/,
			},
			{
				type: 'Style',
				start: /<style/,
				end: /<\/style>/,
			},
		],
		'-',
	);

	let ast: SvelteNode[];
	try {
		ast = svelteParse(blocks.replaced);
	} catch (err) {
		if (err instanceof Error && 'start' in err && 'end' in err && 'frame' in err) {
			// @ts-ignore
			const raw = rawCode.slice(err.start.character, err.end.character);
			throw new ParserError(
				// @ts-ignore
				err.message + '\n' + err.frame,
				{
					// @ts-ignore
					line: err.start.line,
					// @ts-ignore
					col: err.start.column,
					raw,
				},
			);
		}
		return {
			nodeList: [],
			isFragment: true,
			parseError: err instanceof Error ? err.message : new Error(`${err}`).message,
		};
	}

	const nodes = traverse(ast, null, blocks.replaced, options);

	const nodeList: MLASTNode[] = restoreNode(flattenNodes(nodes, blocks.replaced), blocks);

	return {
		nodeList,
		isFragment: true,
	};
};
