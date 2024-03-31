//!native
//!nonstrict
//!optimize 2

import GraphEdge from "./graph-edge";
import type Keyable from "./keyable";

export default class GraphVertex<T extends defined> implements Keyable {
	public degree = 0;
	public readonly edges = new Array<GraphEdge<T>>();

	public constructor(public readonly value: T) {
		if (value === undefined) throw "value must be defined";
	}

	public addEdge(graphEdge: GraphEdge<T>) {
		const degree = this.degree;
		this.degree = degree + 1;
		this.edges[degree] = graphEdge;
		return this;
	}

	public deleteEdge(graphEdge: GraphEdge<T>) {
		const edges = this.edges;
		const index = edges.indexOf(graphEdge);
		if (index !== -1 && edges.unorderedRemove(index)) this.degree -= 1;
		return this;
	}

	public getNeighbors() {
		return this.edges.map(({ finishVertex, startVertex }) => (startVertex === this ? finishVertex : startVertex));
	}

	public getEdges() {
		return table.clone(this.edges);
	}

	/**
	 * @deprecated Just index the property directly.
	 * @returns
	 */
	public getDegree() {
		return this.degree;
	}

	public hasEdge(graphEdge: GraphEdge<T>) {
		return this.edges.includes(graphEdge);
	}

	public hasNeighbor(graphVertex: GraphVertex<T>) {
		for (const { finishVertex, startVertex } of this.edges)
			if (startVertex === graphVertex || finishVertex === graphVertex) return true;

		return false;
	}

	public findEdge(graphVertex: GraphVertex<T>) {
		for (const edge of this.edges)
			if (edge.startVertex === graphVertex || edge.finishVertex === graphVertex) return edge;

		return undefined;
	}

	public deleteAllEdges() {
		for (const edge of this.edges) this.deleteEdge(edge);
		return this;
	}

	public getKey(): string {
		return `${this.value}`;
	}
}

(GraphVertex as LuaMetatable<GraphVertex<never>>).__tostring = (graphVertex) => `${graphVertex.value}`;
