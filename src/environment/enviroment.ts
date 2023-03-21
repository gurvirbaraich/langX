import { exit } from "process";
import { MK_NULL } from "../macros";
import {
	AssignmentExpression,
	FunctionDeclaration,
	IdentifierLiteral,
	Node,
	RuntimeValue,
} from "../interfaces";
import { setupGlobalState } from "../helpers";

export default class Environment {
	public parent?: Environment;
	public variables: Map<string, RuntimeValue> = new Map();
	public constants: Map<string, RuntimeValue> = new Map();

	get v(): Map<string, RuntimeValue> {
		return this.variables;
	}

	get c(): Map<string, RuntimeValue> {
		return this.constants;
	}

	constructor(parent?: Environment) {
		this.parent = parent;

		if (!parent) {
			setupGlobalState(this);
		}
	}

	lookup(node: IdentifierLiteral) {
		if (this.constants.has(node.value)) {
			return this.constants.get(node.value);
		}

		if (this.variables.has(node.value)) {
			return this.variables.get(node.value);
		}

		if (this.parent) {
			return this.parent.lookup(node);
		}

		console.error("Unexpected Error: Cannot find variable " + node.value);
		exit(1);
	}

	reAssign(node: Node) {
		if (this.constants.has((<AssignmentExpression>node).identifier)) {
			console.error(
				"Unexpected Error: Cannot reassign a constant " +
					(<AssignmentExpression>node).identifier
			);
			exit(1);
		}

		if (this.variables.has((<AssignmentExpression>node).identifier)) {
			this.variables.set(
				(<AssignmentExpression>node).identifier,
				<RuntimeValue>node.value
			);

			return MK_NULL();
		}

		console.error(
			"Unexpected Error: Cannot find variable " +
				(<AssignmentExpression>node).identifier
		);
		exit(1);
	}

	assign(node: Node | FunctionDeclaration) {
		if ((<AssignmentExpression>node).constant) {
			if (this.variables.has((<AssignmentExpression>node).identifier)) {
				console.error(
					"Unexpected Error: Cannot redeclared a variable " +
						(<AssignmentExpression>node).identifier
				);
				exit(1);
			}

			this.constants.set(
				(<AssignmentExpression>node).identifier,
				<RuntimeValue>node.value
			);
		} else {
			if (this.constants.has((<AssignmentExpression>node).identifier)) {
				console.error(
					"Unexpected Error: Cannot redeclared a constant " +
						(<AssignmentExpression>node).identifier
				);
				exit(1);
			}

			this.variables.set(
				(<AssignmentExpression>node).identifier,
				<RuntimeValue>node.value
			);
		}
	}
}
