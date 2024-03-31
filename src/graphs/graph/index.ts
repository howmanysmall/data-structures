//!native
//!nonstrict
//!optimize 2

import { binaryInsert } from "../../utilities/binary-insert";
import GraphEdge from "./graph-edge";
import GraphVertex from "./graph-vertex";

/**
 * Here be dragons.
 */
export class Graph<T extends defined> {
	public readonly edges = new Map<string, GraphEdge<T>>();
	public readonly vertices = new Map<string, GraphVertex<T>>();

	public constructor(public readonly isDirected = false) {}

	public static getNeighbors<T extends defined>(this: void, graphVertex: GraphVertex<T>) {
		return graphVertex.getNeighbors();
	}

	public addVertex(graphVertex: GraphVertex<T>) {
		this.vertices.set(graphVertex.getKey(), graphVertex);
		return this;
	}

	public getVertexByKey(key: string) {
		return this.vertices.get(key);
	}

	public getAllEdges() {
		const array = new Array<GraphEdge<T>>();
		let length = 0;
		for (const [, graphEdge] of this.edges) array[length++] = graphEdge;
		return array;
	}

	public getAllVertices() {
		const array = new Array<GraphVertex<T>>();
		let length = 0;
		for (const [, graphVertex] of this.vertices) array[length++] = graphVertex;
		return array;
	}

	public addEdge(graphEdge: GraphEdge<T>) {
		const { edges, isDirected, vertices } = this;
		let startVertex: GraphVertex<T> = vertices.get(graphEdge.startVertex.getKey())!;
		if (!startVertex) {
			this.addVertex(graphEdge.startVertex);
			startVertex = vertices.get(graphEdge.startVertex.getKey())!;
		}

		let finishVertex: GraphVertex<T> = vertices.get(graphEdge.finishVertex.getKey())!;
		if (!finishVertex) {
			this.addVertex(graphEdge.finishVertex);
			finishVertex = vertices.get(graphEdge.finishVertex.getKey())!;
		}

		if (edges.has(graphEdge.getKey())) throw "GraphEdge already exists.";
		edges.set(graphEdge.getKey(), graphEdge);

		if (isDirected) startVertex.addEdge(graphEdge);
		else {
			startVertex.addEdge(graphEdge);
			finishVertex.addEdge(graphEdge);
		}

		return this;
	}

	public deleteEdge(graphEdge: GraphEdge<T>) {
		const { edges, vertices } = this;
		if (!edges.delete(graphEdge.getKey())) throw "GraphEdge does not exist.";

		vertices.get(graphEdge.startVertex.getKey())?.deleteEdge(graphEdge);
		vertices.get(graphEdge.finishVertex.getKey())?.deleteEdge(graphEdge);
		return this;
	}

	public findEdge(startVertex: GraphVertex<T>, finishVertex: GraphVertex<T>) {
		return this.vertices.get(startVertex.getKey())?.findEdge(finishVertex);
	}

	public getWeight() {
		let weight = 0;
		for (const graphEdge of this.getAllEdges()) weight += graphEdge.weight;
		return weight;
	}

	public reverse() {
		for (const graphEdge of this.getAllEdges()) {
			this.deleteEdge(graphEdge);
			graphEdge.reverse();
			this.addEdge(graphEdge);
		}

		return this;
	}

	public getVerticesIndices() {
		const verticesIndices = new Map<string, number>();
		let index = 0;
		for (const graphVertex of this.getAllVertices()) {
			verticesIndices.set(graphVertex.getKey(), index);
			index += 1;
		}

		return verticesIndices;
	}

	public getAdjacencyMatrix(shouldThrow = false) {
		const vertices = this.getAllVertices();
		const length = vertices.size();

		const adjacencyMatrix = new Array<Array<number>>(length);
		for (const index of $range(0, length - 1)) adjacencyMatrix[index] = new Array(length, math.huge);

		const verticesIndices = this.getVerticesIndices();
		let vertexIndex = 0;
		for (const graphVertex of vertices) {
			for (const neighbor of graphVertex.getNeighbors()) {
				const neighborIndex = verticesIndices.get(neighbor.getKey());
				if (neighborIndex === undefined) {
					if (shouldThrow) throw "GraphVertex does not exist.";
					continue;
				}

				const graphEdge = this.findEdge(graphVertex, neighbor);
				if (!graphEdge) throw "Cannot read property 'Weight' of undefined edge.";

				adjacencyMatrix[vertexIndex][neighborIndex] = graphEdge.weight;
			}
			vertexIndex += 1;
		}

		return adjacencyMatrix;
	}
}

(Graph as LuaMetatable<Graph<never>>).__tostring = (graph) => {
	const keys = new Array<string>();
	for (const [vertexKey] of graph.vertices) binaryInsert(keys, vertexKey);
	return `Graph<[${keys.join()}]>`;
};
