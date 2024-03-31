//!native
//!nonstrict
//!optimize 2
/// <reference types="@rbxts/testez/globals" />

import { MinPriorityQueue } from "../min-priority-queue";

export = () => {
	describe("MinPriorityQueue", () => {
		describe("constructor", () => {
			it("should return a MinPriorityQueue", () => {
				expect(new MinPriorityQueue() instanceof MinPriorityQueue).to.equal(true);
			});
		});

		describe("MinPriorityQueue.isEmpty", () => {
			it("should return a boolean", () => {
				expect(new MinPriorityQueue().isEmpty()).to.be.a("boolean");
			});
			it("should return true if empty", () => {
				expect(new MinPriorityQueue().isEmpty()).to.equal(true);
			});
			it("should return false if not empty", () => {
				const queue = new MinPriorityQueue();
				queue.insertWithPriority("value", 1);
				expect(queue.isEmpty()).to.equal(false);
			});
		});

		describe("MinPriorityQueue.insertWithPriority", () => {
			it("should return a number", () => {
				expect(new MinPriorityQueue().insertWithPriority("1", 1)).to.be.a("number");
			});
			it("should insert into the proper location", () => {
				const queue = new MinPriorityQueue<string>();
				queue.insertWithPriority("2", 2);
				queue.insertWithPriority("3", 3);
				expect(queue.insertWithPriority("1", 1)).to.equal(2);
			});
		});

		describe("MinPriorityQueue.changePriority", () => {
			it("should return a number", () => {
				const queue = new MinPriorityQueue<string>();
				queue.insertWithPriority("1", 4);
				queue.insertWithPriority("2", 2);
				queue.insertWithPriority("3", 3);
				expect(queue.changePriority("1", 1)).to.be.a("number");
			});

			it("should return adjusted location", () => {
				const queue = new MinPriorityQueue<string>();
				queue.insertWithPriority("1", 4);
				queue.insertWithPriority("2", 2);
				queue.insertWithPriority("3", 3);
				expect(queue.changePriority("1", 1)).to.equal(2);
			});

			it("should throw if the passed value is null", () => {
				expect(() => new MinPriorityQueue<string>().changePriority("1", 1)).to.throw();
			});
		});
	});
};
