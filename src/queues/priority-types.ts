//!native
//!nonstrict
//!optimize 2

export interface HeapEntry<T extends defined> {
	readonly priority: number;
	readonly value: T;
}
