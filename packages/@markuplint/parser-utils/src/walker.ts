import type { MLASTNode, Walker } from '@markuplint/ml-ast';

export function walk(
	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	nodeList: readonly MLASTNode[],
	walker: Walker,
	depth = 0,
) {
	for (const node of nodeList) {
		walker(node, depth);
		if ('childNodes' in node) {
			if (node.type === 'endtag') {
				continue;
			}
			if (node.childNodes && node.childNodes.length > 0) {
				walk(node.childNodes, walker, depth + 1);
			}
			if ('pairNode' in node && node.pairNode) {
				walker(node.pairNode, depth);
			}
		}
	}
}
