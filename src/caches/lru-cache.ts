//!native
//!nonstrict
//!optimize 2

import { t } from "@rbxts/t";

const isValidCapacity = t.intersection(t.integer, t.numberMin(0));

/**
 * A LRUCache (least recently used cache) is a type of cache that is
 * used to store a limited number of items. When an item is added to the
 * cache, if the item already exists in the cache, it is moved to the
 * end of the list. If the item does not already exist in the cache, it
 * is added to the end of the list.
 */
export class LRUCache<K extends defined, V extends defined> {
	public readonly capacity: number;
	public size = 0;
	public constructor(capacity: number) {
		assert(isValidCapacity(capacity), "Capacity must be a number greater than 0");
		this.capacity = capacity;
	}

	public static readonly instanceof = <K extends defined, V extends defined>(
		value: unknown,
	): value is LRUCache<K, V> => typeIs(value, "table") && getmetatable(value) === LRUCache;

	public get(key: K): V | undefined {
		const node = this.nodesMap.get(key);
		if (!node) return undefined;

		this.evict(node);
		this.append(node);
		return node.value;
	}

	public set(key: K, value: V) {
		const node = this.nodesMap.get(key);
		if (node) {
			node.value = value;
			this.evict(node);
			this.append(node);
		} else this.append({ key, value });
	}

	private readonly head = {} as Node<K, V>;
	private readonly nodesMap = new Map<K, Node<K, V>>();
	private readonly tail = {} as Node<K, V>;

	private append(node: Node<K, V>) {
		this.nodesMap.set(node.key, node);
		const { head, tail } = this;

		if (head.next) {
			const tailPrevious = tail.previous!;
			tailPrevious.next = node;
			node.previous = tailPrevious;
			node.next = tail;
			tail.previous = node;
		} else {
			head.next = node;
			tail.previous = node;
			node.previous = head;
			node.next = tail;
		}

		const size = this.size + 1;
		this.size = size;
		if (size > this.capacity) this.evict(head.next!);
	}
	private evict(node: Node<K, V>) {
		this.nodesMap.delete(node.key);
		this.size -= 1;

		const previousNode = node.previous!;
		const nextNode = node.next!;
		const { head, tail } = this;

		if (previousNode === head && nextNode === tail) {
			head.next = undefined;
			tail.previous = undefined;
			this.size = 0;
			return;
		}

		if (previousNode === head) {
			nextNode.previous = head;
			head.next = nextNode;
			return;
		}

		if (nextNode === tail) {
			previousNode.next = tail;
			tail.previous = previousNode;
			return;
		}

		previousNode.next = nextNode;
		nextNode.previous = previousNode;
	}
}

interface Node<K extends defined, V extends defined> {
	readonly key: K;
	next?: Node<K, V>;
	previous?: Node<K, V>;
	value: V;
}
