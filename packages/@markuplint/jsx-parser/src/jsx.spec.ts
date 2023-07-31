import { describe, test, expect } from 'vitest';

import jsxParser, { getName } from './jsx.js';

describe('jsxParser', () => {
	test('spreadAttribute', () => {
		const ast = jsxParser('<div {...pros} />');
		// @ts-ignore
		expect(ast[0].__hasSpreadAttribute).toBeTruthy();
	});
});

describe('getName', () => {
	test('tags', () => {
		// @ts-ignore
		expect(getName(jsxParser('<div></div>')[0].openingElement.name)).toBe('div');
		// @ts-ignore
		expect(getName(jsxParser('<XNode></XNode>')[0].openingElement.name)).toBe('XNode');
		// @ts-ignore
		expect(getName(jsxParser('<XNode.Prop.xxx></XNode.Prop.xxx>')[0].openingElement.name)).toBe('XNode.Prop.xxx');
		// @ts-ignore
		expect(getName(jsxParser('<svg></svg>')[0].openingElement.name)).toBe('svg');
		// @ts-ignore
		expect(getName(jsxParser('<ns:tag></ns:tag>')[0].openingElement.name)).toBe('ns:tag');
	});
});
