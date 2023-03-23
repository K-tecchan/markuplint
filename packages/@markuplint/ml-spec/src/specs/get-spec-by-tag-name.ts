import type { ElementSpec } from '../types';
import type { ReadonlyDeep } from 'type-fest';

import { resolveNamespace } from '../utils/resolve-namespace';

const cache = new Map<string, any>();

export function getSpecByTagName<K extends keyof ElementSpec = keyof ElementSpec>(
	specs: readonly Pick<ReadonlyDeep<ElementSpec>, 'name' | K>[],
	localName: string,
	namespace: string | null,
) {
	const { localNameWithNS } = resolveNamespace(localName, namespace || undefined);
	let spec: Pick<ReadonlyDeep<ElementSpec>, 'name' | K> | null | undefined = cache.get(localNameWithNS);
	if (spec !== undefined) {
		return spec;
	}
	spec = specs.find(spec => spec.name === localNameWithNS) || null;
	cache.set(localNameWithNS, spec);
	return spec;
}
