//!native
//!nonstrict
//!optimize 2

import type { CompareFunction } from "../types";

function findClosest<T extends defined>(
	array: Array<T>,
	value: T,
	low: number,
	high: number,
	eq?: CompareFunction<T>,
	lt?: CompareFunction<T>,
) {
	let middle: number;

	{
		const sum = low + high;
		middle = (sum - (sum % 2)) / 2;
	}

	if (middle === -1) return undefined;

	let value2 = array[middle];
	while (middle !== high) {
		if (eq) {
			if (eq(value, value2)) return middle;
		} else if (value === value2) return middle;

		const bool = lt?.(value, value2) ?? (value as never as number) < (value2 as never as number);
		if (bool) high = middle - 1;
		else low = middle + 1;

		const sum = low + high;
		middle = (sum - (sum % 2)) / 2;
		value2 = array[middle];
	}

	return middle;
}

/**
 * A class to create sorted arrays. Must contain objects comparable to
 * one another (that can use the `<` and `==` operators). Numbers and
 * strings support these operators by default.
 *
 * @example
 * const array0 = new SortedArray([3, 1, 2]); // will sort
 * const array1 = new SortedArray<string>();
 *
 * @author Validark
 */
export class SortedArray<T extends defined> {
	public readonly array: Array<T>;
	public comparison?: CompareFunction<T>;

	/**
	 * Instantiates and returns a new SortedArray, with optional parameters.
	 * @param baseArray An array of data which will be sorted upon instantiation. If this is omitted, an empty array is used.
	 * @param comparison An optional comparison function which is used to customize the element sorting, which will be given two elements `a` and `b` from the array as parameters. The function should return a boolean value specifying whether the first argument should be before the second argument in the sequence. If no comparison function is passed, the Lua-default `a < b` sorting is used.
	 */
	public constructor(baseArray: Array<T> = [], comparison?: CompareFunction<T>) {
		this.array = baseArray ? table.clone(baseArray).sort(comparison) : [];
		this.comparison = comparison;
	}

	public static readonly instanceof = <T extends defined>(value: unknown): value is SortedArray<T> =>
		typeIs(value, "table") && getmetatable(value) === SortedArray;

	public map<U extends defined>(
		callback: (value: T, index: number, array: ReadonlyArray<T>) => U,
		comparison?: CompareFunction<U>,
	): SortedArray<U>;
	public map(callback: (value: T, index: number, array: ReadonlyArray<T>) => T, comparison?: CompareFunction<T>) {
		return new SortedArray(this.array.map(callback), comparison).sort();
	}

	/**
	 * A combination function of `Array.filter` and `Array.map`. If
	 * the predicate function returns nil, the value will not be
	 * included in the new list. Any other result will add the result
	 * value to the new list.
	 *
	 * @example
	 * const array = new SortedArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).mapFiltered((value) => {
	 * 	return value % 2 === 0 || value % 3 === 0 ? undefined : value;
	 * });
	 * print(array); // [2, 4, 8, 10];
	 *
	 * @param callback
	 * @param comparison
	 * @returns
	 */
	public mapFiltered<U>(
		callback: (value: T, index: number, array: ReadonlyArray<T>) => U,
		comparison?: CompareFunction<U>,
	): SortedArray<NonNullable<U>> {
		return new SortedArray(this.array.mapFiltered(callback), comparison).sort();
	}

	/**
	 * Inserts an element in the proper place which would preserve the array's sorted order.
	 * Returns the index the element was inserted.
	 *
	 * @param value
	 * @returns
	 */
	public insert(value: T) {
		const array = this.array;
		let position = findClosest(array, value, 0, array.size() - 1) ?? 0;

		const value2 = array[position];
		if (value2 !== undefined) {
			const bool = this.comparison?.(value, value2) ?? (value as never as number) < (value2 as never as number);
			position = bool ? position : position + 1;
		}

		array.insert(position, value);
		return position;
	}

	/**
	 * Finds an Element in a SortedArray and returns its position (or nil if non-existent).
	 *
	 * @param value The element to find or something that will be matched by the `eq` function.
	 * @param eq An optional function which checks for equality between the passed-in element and the other elements in the SortedArray.
	 * @param lt An optional less-than comparison function, which falls back on the comparison passed in from `new SortedArray`.
	 * @param low The lowest index to search. Defaults to 0.
	 * @param high The high index to search. Defaults to the length of the SortedArray - 1.
	 * @returns
	 */
	public find(value: T, eq?: CompareFunction<T>, lt?: CompareFunction<T>, low = 0, high = this.array.size() - 1) {
		const array = this.array;
		const position = findClosest(array, value, low, high, eq, lt ?? this.comparison);

		let bool: boolean | undefined;
		if (position !== undefined) bool = eq?.(value, array[position]) ?? value === array[position];
		return bool ? position : undefined;
	}
	public indexOf(value: T, eq?: CompareFunction<T>, lt?: CompareFunction<T>, low = 0, high = this.array.size() - 1) {
		return this.find(value, eq, lt, low, high);
	}

	/**
	 * Makes a shallow copy of the SortedArray.
	 * @returns
	 */
	public copy() {
		return table.clone(this.array);
	}

	/**
	 * Makes a shallow copy of the SortedArray and returns a new SortedArray.
	 * @returns
	 */
	public clone() {
		return new SortedArray(table.clone(this.array), this.comparison).sort();
	}

	/**
	 * Searches the array via {@linkcode find}. If found, it removes the
	 * value and returns the value, otherwise returns undefined. Only
	 * removes a single occurrence.
	 *
	 * @param signature The value you want to remove.
	 * @param eq An optional function which checks for equality between the passed-in element and the other elements in the SortedArray.
	 * @param lt An optional less-than comparison function, which falls back on the comparison passed in from `SortedArray.new`.
	 * @returns
	 */
	public removeElement(signature: T, eq?: CompareFunction<T>, lt?: CompareFunction<T>) {
		const position = this.find(signature, eq, lt);
		return position === undefined ? undefined : this.removeIndex(position);
	}

	/**
	 * Calls `Array.remove` on the SortedArray.
	 * @param index
	 * @returns
	 */
	public removeIndex(index: number) {
		return this.array.remove(index);
	}
	public unorderedRemoveIndex(index: number) {
		return this.array.unorderedRemove(index);
	}
	public pop() {
		return this.array.pop();
	}
	public shift() {
		return this.array.shift();
	}

	/**
	 * Does `this.array.sort(this.comparison)` and returns the SortedArray.
	 * @returns
	 */
	public sort() {
		this.array.sort(this.comparison);
		return this;
	}

	public getIntersection(other: SortedArray<T>, eq?: CompareFunction<T>, lt?: CompareFunction<T>) {
		if (!(other instanceof SortedArray))
			throw `invalid argument #2 to 'getIntersection' (SortedArray expected, got ${typeOf(other)} (${other}))`;

		const commonalities = new SortedArray<T>([], this.comparison);
		let count = 0;
		let position = 0;

		// eslint-disable-next-line unicorn/no-this-assignment, @typescript-eslint/no-this-alias
		let me: SortedArray<T> = this;
		let thisLength = me.array.size();
		let otherLength = other.array.size();

		if (thisLength > otherLength) {
			[thisLength, otherLength] = [otherLength, thisLength];
			[me, other] = [other, me];
		}

		for (const index of $range(0, thisLength - 1)) {
			const current = me.array[index];
			const currentPosition = other.find(current, eq, lt, position, otherLength - 1);
			if (currentPosition !== undefined) {
				position = currentPosition;
				commonalities.array[count++] = current;
			}
		}

		return commonalities;
	}

	public size() {
		return this.array.size();
	}

	public isEmpty() {
		return this.array.isEmpty();
	}

	public get(index: number) {
		return this.array[index];
	}
}

const metatable = SortedArray as LuaMetatable<SortedArray<never>>;
// hello luau users
metatable.__len = (sortedArray) => sortedArray.array.size();
metatable.__tostring = (sortedArray) => `SortedArray<[${sortedArray.array.map(tostring).join()}]>`;
