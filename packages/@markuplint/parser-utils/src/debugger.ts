import type { MLASTAttr, MLASTNode, MLToken } from '@markuplint/ml-ast';

export function nodeListToDebugMaps(
	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	nodeList: MLASTNode[],
	withAttr = false,
) {
	return nodeList
		.map(n => {
			const r: string[] = [];
			if (!n.isGhost) {
				r.push(tokenDebug(n));
				if (withAttr && 'attributes' in n) {
					r.push(...attributesToDebugMaps(n.attributes).flat());
				}
			} else {
				r.push(`[N/A]>[N/A](N/A)${n.nodeName}: ${visibleWhiteSpace(n.raw)}`);
			}
			return r;
		})
		.flat();
}

export function attributesToDebugMaps(
	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	attributes: MLASTAttr[],
) {
	return attributes.map(n => {
		const r = [
			tokenDebug({
				...n,
				name: n.type === 'html-attr' ? n.name.raw : n.raw,
			}),
		];
		if (n.type === 'html-attr') {
			r.push(
				`  ${tokenDebug(n.spacesBeforeName, 'bN')}`,
				`  ${tokenDebug(n.name, 'name')}`,
				`  ${tokenDebug(n.spacesBeforeEqual, 'bE')}`,
				`  ${tokenDebug(n.equal, 'equal')}`,
				`  ${tokenDebug(n.spacesAfterEqual, 'aE')}`,
				`  ${tokenDebug(n.startQuote, 'sQ')}`,
				`  ${tokenDebug(n.value, 'value')}`,
				`  ${tokenDebug(n.endQuote, 'eQ')}`,
				`  isDirective: ${!!n.isDirective}`,
				`  isDynamicValue: ${!!n.isDynamicValue}`,
			);
		}
		if (n.potentialName != null) {
			r.push(`  potentialName: ${visibleWhiteSpace(n.potentialName)}`);
		}
		if (n.type === 'html-attr' && n.candidate) {
			r.push(`  candidate: ${visibleWhiteSpace(n.candidate)}`);
		}
		return r;
	});
}

function tokenDebug<N extends MLToken>(n: N, type = '') {
	return `[${n.startLine}:${n.startCol}]>[${n.endLine}:${n.endCol}](${n.startOffset},${n.endOffset})${
		// @ts-ignore
		n.potentialName ?? n.nodeName ?? n.name ?? n.type ?? type
	}: ${visibleWhiteSpace(n.raw)}`;
}

function visibleWhiteSpace(chars: string) {
	return chars.replace(/\n/g, '⏎').replace(/\t/g, '→').replace(/\s/g, '␣');
}
