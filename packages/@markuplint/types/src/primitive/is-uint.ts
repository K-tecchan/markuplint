/**
 * @see https://html.spec.whatwg.org/dev/common-microsyntaxes.html#non-negative-integers
 *
 * @param value
 */
export function isUint(value: string, options?: { readonly gt?: number }) {
	const matched = /^\d+$/.test(value);
	if (matched && options) {
		const n = parseInt(value, 10);
		if (options.gt != null) {
			return isFinite(n) && options.gt < n;
		}
	}
	return matched;
}
