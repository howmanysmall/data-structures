//!native
//!nonstrict
//!optimize 2
/// <reference types="@rbxts/testez/globals" />

import { LiveRandom } from "../live-random";

export = () => {
	// hopefully roblox doesn't prank me by changing the algorithm
	// biome-ignore lint/correctness/noPrecisionLoss: shut up
	const SEED_TO_USE = 8949857.9991050064563751220703125;

	describe("LiveRandom", () => {
		describe("constructor", () => {
			it("should return a LiveRandom", () => {
				const liveRandom = new LiveRandom(1, 10);
				expect(`${liveRandom}`.match("^LiveRandom")[0]).to.be.ok();
				expect(liveRandom instanceof LiveRandom).to.equal(true);
			});
		});

		describe("LiveRandom.peek", () => {
			it("should return the correct value every time", () => {
				for (const _ of $range(1, 100)) expect(new LiveRandom(1, 10, SEED_TO_USE).peek()).to.equal(10);
			});

			it("should return the correct value every time, even with a constant random seed", () => {
				const randomSeed = (os.clock() % 1) * 1e7;
				const value = new LiveRandom(1, 10, randomSeed).peek();
				for (const _ of $range(1, 100)) expect(new LiveRandom(1, 10, randomSeed).peek()).to.equal(value);
			});

			it("should not regenerate", () => {
				const liveRandom = new LiveRandom(1, 10);
				// biome-ignore lint/suspicious/noSelfCompare: shut up
				expect(liveRandom.peek() === liveRandom.peek()).to.equal(true);
			});
		});

		describe("LiveRandom.rig", () => {
			it("should return the same LiveRandom", () => {
				const liveRandom = new LiveRandom(1, 10);
				expect(liveRandom.rig(11)).to.equal(liveRandom);
			});

			it("should return the rigged value on next get/peek", () => {
				expect(new LiveRandom(1, 10, SEED_TO_USE).rig(11).peek()).to.equal(11);
			});
		});

		describe("LiveRandom.get", () => {
			it("should return a unique value in the range only once until we're out, then we repeat", () => {
				const liveRandom = new LiveRandom(1, 10);
				const first = liveRandom.peek();
				const hasSeen = new Set<number>();

				for (const _ of $range(1, 10)) {
					const index = liveRandom.get();
					expect(hasSeen.has(index)).to.equal(false);
					hasSeen.add(index);
				}

				expect(liveRandom.get()).to.equal(first);
			});
		});
	});
};
