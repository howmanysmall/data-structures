//!native
//!nonstrict
//!optimize 2

export class Trie {
	public readonly root: Node = { children: new Map(), isEnding: false };

	public insert(word: string) {
		let current = this.root;
		for (const index of $range(1, word.size())) {
			const [byte] = word.byte(index);
			let nextInLine = current.children.get(byte);
			if (!nextInLine) current.children.set(byte, (nextInLine = { children: new Map(), isEnding: false }));
			current = nextInLine;
		}

		current.isEnding = true;
	}

	public search(word: string) {
		let current = this.root;
		for (const index of $range(1, word.size())) {
			const nextInLine = current.children.get(word.byte(index)[0]);
			if (!nextInLine) return false;
			current = nextInLine;
		}

		return current.isEnding;
	}

	public startsWith(prefix: string) {
		let current = this.root;
		for (const index of $range(1, prefix.size())) {
			const nextInLine = current.children.get(prefix.byte(index)[0]);
			if (!nextInLine) return false;
			current = nextInLine;
		}

		return true;
	}
}

interface Node {
	readonly children: Map<number, Node>;
	isEnding: boolean;
}
