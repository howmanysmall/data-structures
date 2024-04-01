//!native
//!nonstrict
//!optimize 2

// This was entirely created by Validark. All credit goes to this incredible man!

function indexString(value: string, index: number) {
	return value.byte(index + 1)[0];
}

/**
 * # DynSDT Implementations
 *
 * Dynamic Score-Decomposed Tries* which solve the scored prefix completion problem. The C# version is the primary version at the moment. The preliminary TypeScript version in the main repo was created just to match the pseudocode from the paper to help verify the correctness of the pseudocode. The Zig version is still in-development.
 *
 * Paper: [validark.github.io/DynSDT](https://validark.github.io/DynSDT/), entitled *Heap-like Dynamic Score-Decomposed Tries for Top-k Autocomplete*
 *
 * Live Demo: [validark.github.io/DynSDT/demo](https://validark.github.io/DynSDT/demo/)
 *
 * Email autocomplete proof-of-concept: [validark.github.io/DynSDT/web-autocomplete](https://validark.github.io/DynSDT/web-autocomplete/)
 *  - This uses another TypeScript implementation I made which supports aliasing so multiple names/emails can autocomplete to the same person. [The source code is available here](https://github.com/Validark/DynSDT/tree/paper/web-autocomplete).
 *
 * Paper & Demo website code: [/tree/paper](https://github.com/Validark/DynSDT/tree/paper)
 *
 * Give Validark a star [here](https://github.com/Validark/DynSDT)!
 *
 * Keywords: Query Autocomplete, QAC, type-ahead, ranked autosuggest, top-k autocomplete, trie decomposition, Dynamic Score-Decomposed Trie, trie autocomplete, Completion Trie.
 *
 * @author Validark
 * Adapted for Luau + RobloxTS by HowManySmall.
 */
export class DynamicScoreDecomposedTrie {
	public readonly rootBranchPoints: [{ readonly lcp: number; node?: Node }] | [BranchPoint] = [
		{
			lcp: 0,
			node: undefined,
		},
	];

	public getRoot() {
		return this.rootBranchPoints[0].node;
	}
	public setRoot(node: Node) {
		this.rootBranchPoints[0].node = node;
	}

	public topCompletions(prefix: string, kndex: number) {
		const completions = new Array<string>();
		if (!(kndex > 0)) return completions;

		const locus = this.findLocusForPrefix(prefix);
		if (!locus) return completions;

		completions.push(locus.key);
		if (--kndex === 0) return completions;

		let branchPoints = locus.branchPoints;
		let index = 0;

		for (; ; ++index) {
			if (index === branchPoints.size()) return completions;
			if (branchPoints[index].lcp >= prefix.size()) break;
		}
		completions.push(branchPoints[index].node.key);

		const heapPointers = new Array<HeapPointer>();
		while (--kndex > 0) {
			if (branchPoints[index].node.branchPoints.size() > 0) {
				let jndex = heapPointers.push({ branchPoints: branchPoints[index].node.branchPoints, index: 0 }) - 1;
				const element = heapPointers[jndex];
				const score = element.branchPoints[element.index].node.score;
				while (--jndex >= 0 && score < heapPointers[jndex].branchPoints[heapPointers[jndex].index].node.score)
					heapPointers[jndex + 1] = heapPointers[jndex];
				heapPointers[jndex + 1] = element;
			}

			while (++index < branchPoints.size()) {
				if (branchPoints[index].lcp >= prefix.size()) {
					let jndex = heapPointers.push({ branchPoints, index }) - 1;
					const element = heapPointers[jndex];
					const score = element.branchPoints[element.index].node.score;
					while (
						--jndex >= 0 &&
						score < heapPointers[jndex].branchPoints[heapPointers[jndex].index].node.score
					)
						heapPointers[jndex + 1] = heapPointers[jndex];
					heapPointers[jndex + 1] = element;
					break;
				}
			}

			if (heapPointers.size() === 0) return completions;
			({ branchPoints, index } = heapPointers.pop()!);
			completions.push(branchPoints[index].node.key);
		}

		return completions;
	}

	public set(term: string, score: number) {
		if (!this.getRoot()) {
			this.setRoot({
				branchPoints: [],
				key: term,
				score,
			});
			return;
		}

		let branchPoints = this.rootBranchPoints as Array<BranchPoint>;
		let index = 0;
		let node = this.getRoot()!;
		let lcp = 0;

		while (true) {
			for (
				const min = math.min(term.size(), node.key.size());
				lcp < min && indexString(term, lcp) === indexString(node.key, lcp);
				lcp += 1
			);

			if (lcp === term.size() && lcp === node.key.size()) {
				this.setExactMatchFound(score, node, branchPoints, index);
				return;
			}

			if (score > node.score) {
				this.setScoreLocationFound(term, score, lcp, branchPoints, index);
				return;
			}

			branchPoints = node.branchPoints;
			const [newNode, newIndex] = this.findNodeForLcp(branchPoints, lcp);
			if (!newNode) {
				branchPoints.push({ lcp, node: { branchPoints: [], key: term, score } });
				return;
			}

			[node, index] = [newNode, newIndex];
		}
	}

	private setExactMatchFound(score: number, node: Node, branchPoints: Array<BranchPoint>, index: number) {
		node.score = score;
		const nodePoints = node.branchPoints;
		if (nodePoints.size() === 0 || score >= nodePoints[0].node.score) {
			this.insertionSortIndex(branchPoints, index);
			return;
		}

		const pointers = new Array<Pointer>();
		branchPoints[index].node = nodePoints[0].node;
		index = this.insertionSortIndexDown(branchPoints, index);

		pointers.push({
			branchPoints,
			index,
			lcp: nodePoints[0].lcp,
		});
		nodePoints[0] = {
			lcp: node.key.size(),
			node: {
				branchPoints: [],
				key: node.key,
				score,
			},
		};
		this.insertionSortIndexDown(nodePoints, 0);

		for (const branchPoint of nodePoints) {
			const { lcp, node: localNode } = branchPoint;
			// eslint-disable-next-line prefer-const
			let { branchPoints, index, lcp: maxLcp } = pointers[pointers.size() - 1];

			if (lcp >= maxLcp) {
				while (true) {
					branchPoints = branchPoints[index].node.branchPoints;
					const [newNode, newIndex] = this.findNodeForLcp(branchPoints, maxLcp);

					if (!newNode) {
						branchPoint.lcp = maxLcp;
						index = this.insertionSortIntoList(branchPoints, branchPoint);
						break;
					}

					[node, index] = [newNode, newIndex];
					if (localNode.score >= node.score) {
						this.insertionSortIntoList(localNode.branchPoints, branchPoints[index]);
						branchPoint.lcp = maxLcp;
						branchPoints[index] = branchPoint;
						index = this.insertionSortIndexUp(branchPoints, index);
						break;
					}
				}

				if (lcp > maxLcp && localNode !== nodePoints[nodePoints.size() - 1].node)
					pointers.push({ branchPoints, index, lcp });
			} else {
				let left = 0;
				let right = pointers.size() - 2;

				while (left <= right) {
					const middle = left + (right - left).idiv(2);
					if (lcp < pointers[middle].lcp) right = middle - 1;
					else left = middle + 1;
				}

				({ branchPoints, index } = pointers[left]);
				this.insertionSortIntoList(branchPoints[index].node.branchPoints, branchPoint);
			}
		}
	}

	private insertionSortIntoList(branchPoints: Array<BranchPoint>, branchPoint: BranchPoint) {
		return this.insertionSortIndexUp(branchPoints, branchPoints.push(branchPoint) - 1);
	}

	private findNodeForLcp(branchPoints: Array<BranchPoint>, lcp: number): LuaTuple<[Node | undefined, number]> {
		let index = 0;
		for (const branchPoint of branchPoints) {
			if (branchPoint.lcp === lcp) return $tuple(branchPoint.node, index);
			index += 1;
		}

		return $tuple(undefined, 0 / 0);
	}

	private setScoreLocationFound(
		term: string,
		score: number,
		lcp: number,
		branchPoints: Array<BranchPoint>,
		index: number,
	) {
		const newBranchPoints = new Array<BranchPoint>();
		let node = branchPoints[index].node;
		newBranchPoints.push({ lcp, node });

		branchPoints[index].node = {
			branchPoints: newBranchPoints,
			key: term,
			score,
		};

		index = this.insertionSortIndexUp(branchPoints, index);
		node.branchPoints = this.extractLcpsBelowThreshold(node.branchPoints, lcp, newBranchPoints);
		branchPoints = newBranchPoints;
		index = 0;

		while (lcp !== term.size()) {
			do {
				branchPoints = branchPoints[index].node.branchPoints;
				const [newNode, newIndex] = this.findNodeForLcp(branchPoints, lcp);
				if (!newNode) return;
				[node, index] = [newNode, newIndex];
			} while (lcp === node.key.size() || indexString(term, lcp) !== indexString(node.key, lcp));

			const branchPoint = branchPoints[index];
			this.supplantNodeFromParent(branchPoints, index, node, lcp);

			for (
				const min = math.min(term.size(), node.key.size());
				++lcp < min && indexString(term, lcp) === indexString(node.key, lcp);

			);

			if (lcp !== term.size() || lcp !== node.key.size()) {
				const jndex = newBranchPoints.size();
				branchPoint.lcp = lcp;
				newBranchPoints.push(branchPoint);
				node.branchPoints = this.extractLcpsBelowThreshold(node.branchPoints, lcp, newBranchPoints);
				index = this.mergeTwoSortedSubArrays(newBranchPoints, jndex);
				branchPoints = newBranchPoints;
			}
		}

		if (lcp !== node.key.size()) {
			do {
				branchPoints = branchPoints[index].node.branchPoints;
				const [newNode, newIndex] = this.findNodeForLcp(branchPoints, lcp);
				if (!newNode) return;
				[node, index] = [newNode, newIndex];
			} while (lcp !== node.key.size());
			this.supplantNodeFromParent(branchPoints, index, node, lcp);
		}

		const jndex = newBranchPoints.size();
		//Array.prototype.push.apply equivalent
		node.branchPoints.move(0, node.branchPoints.size() - 1, jndex, newBranchPoints);
		this.mergeTwoSortedSubArrays(newBranchPoints, jndex);
	}

	private mergeTwoSortedSubArrays(branchPoints: Array<BranchPoint>, index: number) {
		let finalIndexOfFirstElement = index;

		do {
			let localIndex = index;
			const element = branchPoints[localIndex];

			if (element.node.score <= branchPoints[localIndex - 1].node.score) break;

			do {
				branchPoints[localIndex] = branchPoints[localIndex - 1];
				localIndex -= 1;
			} while (element.node.score > branchPoints[localIndex - 1].node.score);
			branchPoints[localIndex] = element;

			if (finalIndexOfFirstElement === index) finalIndexOfFirstElement = localIndex;
		} while (++index < branchPoints.size());

		return finalIndexOfFirstElement;
	}

	private findLocusForPrefix(prefix: string) {
		let node = this.getRoot();
		let lcp = 0;

		while (node) {
			for (
				const min = math.min(prefix.size(), node.key.size());
				lcp < min && indexString(prefix, lcp) === indexString(node.key, lcp);
				++lcp
			);

			if (lcp === prefix.size()) break;
			[node] = this.findNodeForLcp(node.branchPoints, lcp);
		}

		return node;
	}

	private supplantNodeFromParent(branchPoints: Array<BranchPoint>, index: number, node: Node, lcp: number) {
		const [cull, jndex] = this.findNodeForLcp(node.branchPoints, lcp);
		if (cull === undefined) {
			branchPoints.remove(index);
			return;
		}

		branchPoints[index] = node.branchPoints[jndex];
		this.insertionSortIndexDown(branchPoints, index);
		node.branchPoints.remove(jndex);
	}

	private extractLcpsBelowThreshold(source: Array<BranchPoint>, lcp: number, destination: Array<BranchPoint>) {
		const extracted = new Array<BranchPoint>();
		for (const branchPoint of source) (lcp > branchPoint.lcp ? destination : extracted).push(branchPoint);
		return extracted;
	}

	private insertionSortIndex(branchPoints: Array<BranchPoint>, index: number) {
		const element = branchPoints[index];

		for (; index !== 0 && element.node.score > branchPoints[index - 1].node.score; index -= 1)
			branchPoints[index] = branchPoints[index - 1];
		for (; index + 1 < branchPoints.size() && element.node.score < branchPoints[index + 1].node.score; index += 1)
			branchPoints[index] = branchPoints[index + 1];

		branchPoints[index] = element;
	}
	private insertionSortIndexUp(branchPoints: Array<BranchPoint>, index: number) {
		const element = branchPoints[index];
		for (; index !== 0 && element.node.score > branchPoints[index - 1].node.score; index -= 1)
			branchPoints[index] = branchPoints[index - 1];

		branchPoints[index] = element;
		return index;
	}
	private insertionSortIndexDown(branchPoints: Array<BranchPoint>, index: number) {
		const element = branchPoints[index];
		for (; index + 1 < branchPoints.size() && element.node.score < branchPoints[index + 1].node.score; index += 1)
			branchPoints[index] = branchPoints[index + 1];

		branchPoints[index] = element;
		return index;
	}
}

const metatable = DynamicScoreDecomposedTrie as LuaMetatable<DynamicScoreDecomposedTrie>;
metatable.__tostring = () => "DynamicScoreDecomposedTrie";

interface Node extends BranchPoints {
	readonly key: string;
	score: number;
}
interface BranchPoint {
	lcp: number;
	node: Node;
}
interface Pointer extends BranchPoints {
	readonly index: number;
	readonly lcp: number;
}
interface HeapPointer extends BranchPoints {
	readonly index: number;
}
interface BranchPoints {
	branchPoints: Array<BranchPoint>;
}
