//!native
//!nonstrict
//!optimize 2

import { LFUCache } from "../caches/lfu-cache";
import { LRUCache } from "../caches/lru-cache";

/**
 * An unchecked memoization function. Will retain memoized data forever.
 *
 * @param memoizeFunction
 * @returns
 */
export function memoize<T, U>(memoizeFunction: (index: T) => U) {
	const cache = new Map<T, U>();

	function memoized(index: T): U {
		const cached = cache.get(index);
		if (cached !== undefined) return cached;

		const result = memoizeFunction(index);
		cache.set(index, result);
		return result;
	}

	return memoized;
}

/**
 * A memoization function that uses the {@linkcode LFUCache} data structure to
 * free up items that aren't frequently used.
 *
 * @param memoizeFunction
 * @param capacity
 * @returns
 */
export function memoizeFrequencyCache<T, U extends defined>(memoizeFunction: (index: T) => U, capacity = 15) {
	const cache = new LFUCache<T, U>(capacity);

	function memoized(index: T): U {
		const cached = cache.get(index);
		if (cached !== undefined) return cached;

		const result = memoizeFunction(index);
		cache.set(index, result);
		return result;
	}

	return memoized;
}

/**
 * A memoization function that uses the {@linkcode LRUCache} data structure to
 * free up items that aren't recently used.
 *
 * @param memoizeFunction
 * @param capacity
 * @returns
 */
export function memoizeRecentCache<T extends defined, U extends defined>(
	memoizeFunction: (index: T) => U,
	capacity = 15,
) {
	const cache = new LRUCache<T, U>(capacity);

	function memoized(index: T): U {
		const cached = cache.get(index);
		if (cached !== undefined) return cached;

		const result = memoizeFunction(index);
		cache.set(index, result);
		return result;
	}

	return memoized;
}
