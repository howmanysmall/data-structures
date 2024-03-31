//!native
//!nonstrict
//!optimize 2

import type { HeapEntry } from "./priority-types";

function findClosest<T extends defined>(array: Array<HeapEntry<T>>, priority: number, low: number, high: number) {
	let middle: number;

	{
		const sum = low + high;
		middle = (sum - (sum % 2)) / 2;
	}

	if (middle === -1) return -2;

	let element = array[middle];
	while (middle !== high) {
		const priority2 = element.priority;
		if (priority === priority2) return middle;

		if (priority > priority2) high = middle - 1;
		else low = middle + 1;

		const sum = low + high;
		middle = (sum - (sum % 2)) / 2;
		element = array[middle];
	}

	return middle;
}

/**
 * In a max priority queue, elements are inserted in the order in which they arrive to
 * the queue and the maximum value is always removed first from the queue.
 */
export class MinPriorityQueue<T extends defined> {
	public readonly array = new Array<HeapEntry<T>>();
	public length = 0;

	public static readonly instanceof = <T extends defined>(value: unknown): value is MinPriorityQueue<T> =>
		typeIs(value, "table") && getmetatable(value) === MinPriorityQueue;

	/**
	 * Add an element to the `MinPriorityQueue` with an associated priority.
	 *
	 * @param value
	 * @param priority
	 * @returns
	 */
	public insertWithPriority(value: T, priority: number) {
		const array = this.array;
		let position = findClosest(array, priority, 0, this.length - 1);

		const element = array[position];

		if (element) position = priority > element.priority ? position : position + 1;
		else position = 0;

		array.insert(position, { priority, value });
		this.length += 1;
		return position;
	}
	public insert(value: T, priority: number) {
		return this.insertWithPriority(value, priority);
	}

	/**
	 * Changes the priority of the given value in the `MinPriorityQueue`.
	 */
	public changePriority(value: T, newPriority: number) {
		const array = this.array;
		const index = array.findIndex((element) => element.value === value);
		if (index !== -1) {
			array.remove(index);
			this.length -= 1;
			return this.insertWithPriority(value, newPriority);
		}

		throw "Couldn't find value in the queue?";
	}

	/**
	 * Gets the priority of the first value in the `MinPriorityQueue`. This is the
	 * value that will be removed last.
	 * @returns
	 */
	public getFirstPriority() {
		return this.length === 0 ? undefined : this.array[0].priority;
	}

	/**
	 * Gets the priority of the last value in the `MinPriorityQueue`. This is the
	 * value that will be removed first.
	 * @returns
	 */
	public getLastPriority() {
		const length = this.length;
		return length === 0 ? undefined : this.array[length - 1].priority;
	}

	public popElement(onlyValue?: boolean) {
		const { array, length } = this;
		if (length === 0) return undefined;

		const element = array.remove(length - 1);
		if (element) {
			this.length = length - 1;
			return onlyValue ? element.value : element;
		}

		return undefined;
	}

	/**
	 * Clears the entire `MinPriorityQueue`.
	 */
	public clear() {
		this.array.clear();
		this.length = 0;
		return this;
	}

	public contains(value: T) {
		return this.array.findIndex((element) => element.value === value) !== -1;
	}

	public removePriority(priority: number) {
		const array = this.array;
		const index = findClosest(array, priority, 0, this.length - 1);
		if (index === -2) return;

		array.remove(index);
		this.length -= 1;
	}

	public removeValue(value: T) {
		const array = this.array;
		const index = array.findIndex((element) => element.value === value);
		if (index === -1) return;

		array.remove(index);
		this.length -= 1;
	}

	public size() {
		return this.length;
	}
	public isEmpty() {
		return this.length === 0;
	}
}

const metatable = MinPriorityQueue as LuaMetatable<MinPriorityQueue<never>>;
// hello luau users
metatable.__len = (minPriorityQueue) => minPriorityQueue.length;
metatable.__tostring = (minPriorityQueue) =>
	`MinPriorityQueue<[\n${minPriorityQueue.array.map(({ priority, value }) => `\t{ priority: ${priority}, value: ${value} },`).join("\n")}\n]>`;
