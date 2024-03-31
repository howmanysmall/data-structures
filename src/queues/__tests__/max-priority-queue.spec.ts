//!native
//!nonstrict
//!optimize 2
/// <reference types="@rbxts/testez/globals" />

import { MaxPriorityQueue } from "../max-priority-queue";

export = () => {
	describe("MaxPriorityQueue", () => {
		describe("constructor", () => {
			it("should return a MaxPriorityQueue", () => {
				expect(new MaxPriorityQueue() instanceof MaxPriorityQueue).to.equal(true);
			});
		});

		describe("MaxPriorityQueue.isEmpty", () => {
			it("should return a boolean", () => {
				expect(new MaxPriorityQueue().isEmpty()).to.be.a("boolean");
			});
			it("should return true if empty", () => {
				expect(new MaxPriorityQueue().isEmpty()).to.equal(true);
			});
			it("should return false if not empty", () => {
				const queue = new MaxPriorityQueue();
				queue.insertWithPriority("value", 1);
				expect(queue.isEmpty()).to.equal(false);
			});
		});

		describe("MaxPriorityQueue.insertWithPriority", () => {
			it("should return a number", () => {
				expect(new MaxPriorityQueue().insertWithPriority("1", 1)).to.be.a("number");
			});
			it("should insert into the proper location", () => {
				const queue = new MaxPriorityQueue<string>();
				queue.insertWithPriority("2", 2);
				queue.insertWithPriority("3", 3);
				expect(queue.insertWithPriority("1", 1)).to.equal(0);
			});
		});

		describe("MaxPriorityQueue.changePriority", () => {
			it("should return a number", () => {
				const queue = new MaxPriorityQueue<string>();
				queue.insertWithPriority("1", 4);
				queue.insertWithPriority("2", 2);
				queue.insertWithPriority("3", 3);
				expect(queue.changePriority("1", 1)).to.be.a("number");
			});

			it("should return adjusted location", () => {
				const queue = new MaxPriorityQueue<string>();
				queue.insertWithPriority("1", 4);
				queue.insertWithPriority("2", 2);
				queue.insertWithPriority("3", 3);
				expect(queue.changePriority("1", 1)).to.equal(0);
			});

			it("should throw if the passed value is null", () => {
				expect(() => new MaxPriorityQueue<string>().changePriority("1", 1)).to.throw();
			});
		});
	});
};
