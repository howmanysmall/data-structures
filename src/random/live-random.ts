//!native
//!nonstrict
//!optimize 2

import { gcd } from "../utilities/gcd";

function getRandomRelativePrime(value: number, randomLibrary: Random) {
	if (value === 1) return 1;

	let newValue = randomLibrary.NextInteger(1, value - 1);
	if (gcd(value, newValue) === 1) return newValue;

	do newValue = randomLibrary.NextInteger(1, value - 1);
	while (gcd(newValue, value) !== 1);

	return newValue;
}

/**
 * ## LiveRandom
 *
 * Will loop through all of the numbers in range before repeating.
 * Does not use any table nor any messy bash, just math. B)
 *
 * It first finds a co-prime integer to n between 1 and (n - 1) and constantly increments a running sum.
 *
 * - This is guaranteed to touch all of the integers.
 *
 * ### Complexity
 *
 * - **Storage:** `O(1)`
 * - **Construction:** `O(log(n))`
 * - **Get:** `O(1)`
 *
 * ### Example
 *
 * ```ts
 * const randomLib = new LiveRandom(1, 10);
 * print(randomLib.get())
 * ```
 */
export class LiveRandom {
	public constructor(min: number, max?: number, seed = (os.clock() % 1) * 1e7) {
		if (max === undefined) [max, min] = [min, 1];

		const range = max - min + 1;
		const randomLibrary = new Random(seed);

		this.last = randomLibrary.NextInteger(1, range);
		this.offset = min - 1;
		this.prime = getRandomRelativePrime(range, randomLibrary);
		this.range = range;
	}

	public static instanceof(this: void, object: unknown): object is LiveRandom {
		return typeIs(object, "table") && getmetatable(object) === LiveRandom;
	}

	/**
	 * Peeks at the next value. This does not cause
	 * it to roll a new value.
	 */
	public peek() {
		const rigged = this.rigged;
		const top = rigged[rigged.size() - 1];
		if (top !== undefined) return top;

		const value = this.last + this.prime;
		const range = this.range;
		return (value > range ? value - range : value) + this.offset;
	}

	/**
	 * Rigs the random number generator, which forces
	 * the next value to be the given value.
	 *
	 * @param value The value to rig with.
	 * @returns
	 */
	public rig(value: number) {
		this.rigged.push(value);
		return this;
	}

	/**
	 * Gets a random value.
	 * @returns
	 */
	public get() {
		const range = this.range;
		const rigged = this.rigged;
		const riggedValue = rigged.unorderedRemove(rigged.size() - 1);
		if (riggedValue !== undefined) return riggedValue;

		const value = this.last + this.prime;
		const last = value > range ? value - range : value;
		this.last = last;
		return last + this.offset;
	}

	private last: number;
	private readonly offset: number;
	private readonly prime: number;
	private readonly range: number;
	private readonly rigged = new Array<number>();
}

(LiveRandom as LuaMetatable<LiveRandom>).__tostring = () => "LiveRandom";
