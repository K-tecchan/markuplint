import type { ARIAVersion, ARIARoleInSchema, MLMLSpec, ARIARole } from '../types';
import type { NamespaceURI } from '@markuplint/ml-ast';
import type { ReadonlyDeep } from 'type-fest';

import { ariaSpecs } from './aria-specs';

export function getRoleSpec(
	specs: ReadonlyDeep<MLMLSpec>,
	roleName: string,
	namespace: NamespaceURI,
	version: ARIAVersion,
): (ARIARole & { superClassRoles: ARIARoleInSchema[] }) | null {
	const role = getRoleByName(specs, roleName, namespace, version);
	if (!role) {
		return null;
	}
	const superClassRoles = recursiveTraverseSuperClassRoles(specs, roleName, namespace, version);
	return {
		name: role.name,
		isAbstract: !!role.isAbstract,
		requiredContextRole: role.requiredContextRole?.slice() ?? [],
		requiredOwnedElements: role.requiredOwnedElements?.slice() ?? [],
		accessibleNameRequired: !!role.accessibleNameRequired,
		accessibleNameFromAuthor: !!role.accessibleNameFromAuthor,
		accessibleNameFromContent: !!role.accessibleNameFromContent,
		accessibleNameProhibited: !!role.accessibleNameProhibited,
		childrenPresentational: !!role.childrenPresentational,
		ownedProperties: role.ownedProperties?.slice() ?? [],
		prohibitedProperties: role.prohibitedProperties?.slice() ?? [],
		superClassRoles,
	};
}

function recursiveTraverseSuperClassRoles(
	specs: ReadonlyDeep<MLMLSpec>,
	roleName: string,
	namespace: NamespaceURI,
	version: ARIAVersion,
) {
	const roles: ARIARoleInSchema[] = [];
	const superClassRoles = getSuperClassRoles(specs, roleName, namespace, version);
	if (superClassRoles) {
		roles.push(...superClassRoles);
		for (const superClassRole of superClassRoles) {
			const ancestorRoles = recursiveTraverseSuperClassRoles(specs, superClassRole.name, namespace, version);
			roles.push(...ancestorRoles);
		}
	}
	return roles;
}

function getSuperClassRoles(
	specs: ReadonlyDeep<MLMLSpec>,
	roleName: string,
	namespace: NamespaceURI,
	version: ARIAVersion,
) {
	const role = getRoleByName(specs, roleName, namespace, version);
	return (
		role?.generalization
			?.map(roleName => getRoleByName(specs, roleName, namespace, version))
			.filter((role): role is ARIARoleInSchema => !!role) || null
	);
}

function getRoleByName(specs: ReadonlyDeep<MLMLSpec>, roleName: string, namespace: NamespaceURI, version: ARIAVersion) {
	const { roles, graphicsRoles } = ariaSpecs(specs, version);
	let role = roles.find(r => r.name === roleName);
	if (!role && namespace === 'http://www.w3.org/2000/svg') {
		role = graphicsRoles.find(r => r.name === roleName);
	}
	return role;
}
