import { TokenKind } from "../enums";
import Environment from "../environment/enviroment";

export interface Token {
	value: string;
	type: TokenKind;
}

export interface Program {
	kind: "program";
	body: Node[];
}

export interface Node {
	value: string | number | Node | RuntimeValue;
	kind:
		| "numbericLiteral"
		| "assignmentLiteral"
		| "stringicLiteral"
		| "identifierLiteral"
		| "mutableLiteral"
		| "assignmentExpression"
		| "objectLiteral"
		| "propertyLiteral"
		| "arrayLiteral"
		| "memberExpression"
		| "callExpression"
		| "functionDeclaration"
		| "binaryExpression";
}

export interface NumbericLiteral extends Node {
	value: number;
	kind: "numbericLiteral";
}

export interface StringicLiteral extends Node {
	value: string;
	kind: "stringicLiteral";
}

export interface IdentifierLiteral extends Node {
	value: string;
	kind: "identifierLiteral";
}

export interface MutLiteral extends Node {
	value: string;
	identifier: string;
	kind: "mutableLiteral";
}

export interface BinaryExpression extends Node {
	LHS: Node;
	RHS: Node;
	opreator: string;
	kind: "binaryExpression";
}

export interface AssignmentExpression extends Node {
	constant: boolean;
	identifier: string;
	value: Node | FunctionValue;
	kind: "assignmentExpression";
}

export interface AssignmentLiteral extends Node {
	value: Node;
	identifier: string;
	kind: "assignmentLiteral";
}

export interface ObjectLiteral extends Node {
	kind: "objectLiteral";
	properites: PropertyLiteral[];
}

export interface PropertyLiteral extends Node {
	key: string;
	value: Node;
	kind: "propertyLiteral";
}

export interface CallExpression extends Node {
	caller: Node;
	arguments: Node[];
	kind: "callExpression";
}

export interface MemberExpression extends Node {
	object: Node;
	property: Node;
	computed: boolean;
	kind: "memberExpression";
}

export interface FunctionDeclaration extends Node {
	body: Node[];
	name: string;
	parameters: string[];
	kind: "functionDeclaration";
}

export interface ArrayLiteral extends Node {
	values: Node[];
	kind: "arrayLiteral";
}

/**
 * Runtime Values
 */
export interface RuntimeValue {
	type: "number" | "string" | "null" | "boolean" | "object" | "native-fn" | "array" | "function"; 
	value: string | number | null | true | false | Map<string, RuntimeValue>;
}

export interface NumberValue extends RuntimeValue {
	value: number;
	type: "number";
}

export interface StringValue extends RuntimeValue {
	value: string;
	type: "string";
}

export interface NullValue extends RuntimeValue {
	value: null;
	type: "null";
}

export interface BooleanValue extends RuntimeValue {
	type: "boolean";
	value: true | false;
}

export interface ObjectValue extends RuntimeValue {
	type: "object";
	value: Map<string, RuntimeValue>;
}

export type FunctionCall = (args: RuntimeValue[], env: Environment) => RuntimeValue

export interface NativeFnValue extends RuntimeValue {
	type: "native-fn";
	call: FunctionCall;
}

export interface FunctionValue extends RuntimeValue {
	name: string;
	body: Node[];
	type: "function";
	parameters: string[];
	environment: Environment;
}

export interface ArrayValue extends RuntimeValue {
	type: "array";
	values: RuntimeValue[];
}