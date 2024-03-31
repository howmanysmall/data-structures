//!native
//!nonstrict
//!optimize 2

import type GraphVertex from "./graph-vertex";
import type Keyable from "./keyable";

export default class GraphEdge<T extends defined> implements Keyable {
	public constructor(
		public startVertex: GraphVertex<T>,
		public finishVertex: GraphVertex<T>,
		public readonly weight = 0,
	) {}

	public getKey(): string {
		return `${this.startVertex.getKey()}_${this.finishVertex.getKey()}`;
	}

	public reverse() {
		[this.startVertex, this.finishVertex] = [this.finishVertex, this.startVertex];
		return this;
	}
}

(GraphEdge as LuaMetatable<GraphEdge<never>>).__tostring = (graphEdge) => `GraphEdge<${graphEdge.getKey()}>`;
