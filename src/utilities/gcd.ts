//!native
//!nonstrict
//!optimize 2

export function gcd(a: number, b: number) {
	while (b > 0) [a, b] = [b, a % b];
	return a;
}
