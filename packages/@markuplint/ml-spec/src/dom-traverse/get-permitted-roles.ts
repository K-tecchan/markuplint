import type { ARIAVersion, MLMLSpec } from '../types';
import type { ReadonlyDeep } from 'type-fest';

import { getPermittedRoles as _getPermittedRoles } from '../specs/get-permitted-roles';

export function getPermittedRoles(
	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	el: Element,
	version: ARIAVersion,
	specs: ReadonlyDeep<MLMLSpec>,
) {
	return _getPermittedRoles(specs, el.localName, el.namespaceURI, version, el.matches.bind(el));
}
