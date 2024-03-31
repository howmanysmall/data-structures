//!native
//!nonstrict
//!optimize 2

import { t } from "@rbxts/t";

const isValidCapacity = t.intersection(t.integer, t.numberMin(0));

export class LFUCache<K, V extends defined> {
	public readonly capacity: number;
	public constructor(capacity: number) {
		assert(isValidCapacity(capacity), "Capacity must be a number greater than 0");
		this.capacity = capacity;
	}

	public static readonly instanceof = <K, V extends defined>(value: unknown): value is LFUCache<K, V> =>
		typeIs(value, "table") && getmetatable(value) === LFUCache;

	public get(key: K): V | undefined {
		const cache = this.cache;
		const item = cache.get(key);
		if (!item) return undefined;

		const frequencyHash = this.frequencyHash;
		const frequency = item.frequency + 1;

		frequencyHash.get(frequency - 1)?.delete(key);
		item.frequency = frequency;

		const currentSet = frequencyHash.get(frequency);
		if (currentSet) currentSet.add(key);
		else frequencyHash.set(frequency, new Set([key]));

		cache.set(key, item);

		const minimumFrequency = this.minimumFrequency;
		if (frequencyHash.get(minimumFrequency)!.isEmpty()) this.minimumFrequency = minimumFrequency + 1;

		return item.value;
	}

	public set(key: K, value: V) {
		const capacity = this.capacity;
		if (capacity < 1) return;

		const { cache, frequencyHash, minimumFrequency } = this;
		const cached = cache.get(key);
		if (cached) {
			const frequency = cached.frequency + 1;
			frequencyHash.get(frequency - 1)?.delete(key);

			cached.frequency = frequency;
			cached.value = value;
			cache.set(key, cached);

			const currentSet = frequencyHash.get(frequency);
			if (currentSet) currentSet.add(key);
			else frequencyHash.set(frequency, new Set([key]));

			if (frequencyHash.get(minimumFrequency)!.isEmpty()) this.minimumFrequency = minimumFrequency + 1;
			return;
		}

		if (cache.size() === capacity) {
			const hash = frequencyHash.get(minimumFrequency)!;
			const [keyToEvict] = next(hash);
			assert(keyToEvict !== undefined, "keyToEvict should be defined");

			hash.delete(keyToEvict);
			cache.delete(keyToEvict);
			if (hash.isEmpty()) frequencyHash.delete(minimumFrequency);
		}

		const item: CacheItem<V> = { frequency: 1, value };
		cache.set(key, item);

		const currentSet = frequencyHash.get(1);
		if (currentSet) currentSet.add(key);
		else frequencyHash.set(1, new Set([key]));

		this.minimumFrequency = 1;
	}

	private readonly cache = new Map<K, CacheItem<V>>();
	private readonly frequencyHash = new Map<number, Set<K>>([[0, new Set()]]);
	private minimumFrequency = 0;
}

const metatable = LFUCache as LuaMetatable<LFUCache<never, never>>;
metatable.__tostring = () => "LFUCache";

interface CacheItem<V extends defined> {
	frequency: number;
	value: V;
}
