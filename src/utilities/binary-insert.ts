//!native
//!nonstrict
//!optimize 2

import type { CompareFunction } from "../types";

export function binaryInsert<T extends defined>(array: Array<T>, value: T, lessThan?: CompareFunction<T>) {
	let left = 0;
	let right = array.size() - 1;

	while (left <= right) {
		const middle = (left + right).idiv(2);
		const leftValue = array[left];
		const middleValue = array[middle];

		if (lessThan?.(leftValue, middleValue) ?? (leftValue as never as number) < (middleValue as never as number))
			right = middle - 1;
		else left = middle + 1;
	}

	array.insert(left, value);
}
