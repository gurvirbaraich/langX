import { exit } from "process";
import {
	AssignmentExpression,
	BinaryExpression,
	CallExpression,
	FunctionDeclaration,
	FunctionValue,
	IdentifierLiteral,
	MemberExpression,
	NativeFnValue,
	Node,
	NumberValue,
	ObjectLiteral,
	ObjectValue,
	Program,
	RuntimeValue,
	StringValue,
} from "../interfaces";
import { MK_NULL, MK_STRING } from "../macros";
import Environment from "./enviroment";

export class Interpreter {
	private static environment: Environment = new Environment();

	static evaluate_program(program: Program): RuntimeValue {
		let last_evaluated: RuntimeValue = MK_NULL();

		for (const statement of program.body) {
			last_evaluated = this.evaluate(statement, this.environment);
		}

		return last_evaluated;
	}

	static evaluate(node: Node, scope: Environment): RuntimeValue {
		switch (node.kind) {
			case "numbericLiteral": {
				return <NumberValue>{
					type: "number",
					value: node.value,
				};
			}

			case "stringicLiteral": {
				return <StringValue>{
					type: "string",
					value: node.value,
				};
			}

			case "binaryExpression": {
				return this.evaluate_binary_expression(<BinaryExpression>node, scope);
			}

			case "identifierLiteral": {
				return scope.lookup(<IdentifierLiteral>node);
			}

			case "assignmentExpression": {
				node.value = this.evaluate(<Node>node.value, scope);
				scope.assign(<Node>node);
				return MK_NULL();
			}

			case "assignmentLiteral": {
				node.value = this.evaluate(<Node>node.value, scope);
				scope.reAssign(<Node>node);
				return MK_NULL();
			}

			case "objectLiteral": {
				return this.evaluate_object_expression(<ObjectLiteral>node, scope);
			}

			case "callExpression": {
				return this.evaluate_call_expression(<CallExpression>node, scope);
			}

			case "functionDeclaration": {
				return this.evaluate_function_declaration(<FunctionDeclaration>node, scope);
			}

			case "memberExpression": {
				return this.evaluate_member_expression(<MemberExpression>node, scope);
			}

			default: {
				console.error(
					"This node has not yet been setup for interpretation.",
					node
				);
			}
		}
	}

	private static evaluate_member_expression(node: MemberExpression, scope: Environment): RuntimeValue {
		if (node.object.kind === "memberExpression") {}

		const value: Map<string, RuntimeValue> = (this.evaluate(node.object, scope).value) as Map<string, RuntimeValue>;
		const property = !node.computed ? <string>node.property.value : <string>(this.evaluate_computed_property(node.property, scope).value);

		return value.get(property);
	}

	private static evaluate_computed_property(propery, scope: Environment): RuntimeValue {
		return this.evaluate(propery, scope);
	}

	private static evaluate_LHS_RHS_expression(
		LHS: RuntimeValue,
		RHS: RuntimeValue,
		opreator: string
	): RuntimeValue {
		switch (opreator) {
			case "+":
				return <NumberValue | StringValue>{
					type:
						LHS.type === "string" || RHS.type === "string"
							? "string"
							: "number",
					value: (<NumberValue>LHS).value + (<NumberValue>RHS).value,
				};
			case "-":
				return <NumberValue | StringValue>{
					type:
						LHS.type === "string" || RHS.type === "string"
							? "string"
							: "number",
					value: (<NumberValue>LHS).value - (<NumberValue>RHS).value,
				};
			case "*":
				return <NumberValue | StringValue>{
					type:
						LHS.type === "string" || RHS.type === "string"
							? "string"
							: "number",
					value: (<NumberValue>LHS).value * (<NumberValue>RHS).value,
				};
			case "/":
				return <NumberValue | StringValue>{
					type:
						LHS.type === "string" || RHS.type === "string"
							? "string"
							: "number",
					value: (<NumberValue>LHS).value / (<NumberValue>RHS).value,
				};
			case "%":
				return <NumberValue | StringValue>{
					type:
						LHS.type === "string" || RHS.type === "string"
							? "string"
							: "number",
					value: (<NumberValue>LHS).value % (<NumberValue>RHS).value,
				};
		}
	}

	private static evaluate_binary_expression(node: BinaryExpression, scope: Environment) {
		const LHS = this.evaluate(node.LHS, scope);
		const RHS = this.evaluate(node.RHS, scope);

		if (
			(LHS.type === "number" || LHS.type === "string") &&
			(RHS.type === "number" || RHS.type === "string")
		) {
			return Interpreter.evaluate_LHS_RHS_expression(
				<NumberValue>LHS,
				<NumberValue>RHS,
				node.opreator
			);
		}

		return MK_NULL();
	}

	private static evaluate_object_expression(node: ObjectLiteral, scope: Environment): RuntimeValue {
		const object = <ObjectValue>{
			type: "object",
			value: new Map<string, RuntimeValue>(),
		};

		for (const property of node.properites) {
			const runtimeValue =
				property.value === undefined
					? this.environment.lookup(<IdentifierLiteral>{
							kind: "identifierLiteral",
							value: property.key,
					  })
					: this.evaluate(property.value, scope);

			object.value.set(property.key, runtimeValue);
		}

		return object;
	}

	private static evaluate_call_expression(node: CallExpression, scope: Environment): RuntimeValue {
		const fn = this.evaluate(node.caller, scope);
		const args = node.arguments.map((arg) => this.evaluate(arg, scope));

		if (fn.type === "native-fn") {
			return (<NativeFnValue>fn).call(args, scope);
		}

		if (fn.type === "function") {
			const func = <FunctionValue>fn;
			const env = new Environment(func.environment);

			for (let i = 0; i < func.parameters.length; i++) {
				env.assign(<AssignmentExpression>{
					value: args[i],
					constant: false,
					kind: "assignmentExpression",
					identifier: func.parameters[i],
				});
			}

			let result: RuntimeValue = MK_NULL();

			for (const stmt of func.body) {
				// if (stmt.kind === "functionDeclaration") {
				// 	scope.assign(<AssignmentExpression>{
				// 		value: stmt,
				// 		constant: false,
				// 		kind: "assignmentExpression",
				// 		identifier: (<FunctionDeclaration>stmt).name,
				// 	});
				// }

				result = this.evaluate(stmt, env);
			}

			return result;
		}

		console.error("Uncaught Syntax Error: Cannot call something that is not a function");
		exit(1);
	}

	private static evaluate_function_declaration(node: FunctionDeclaration, scope: Environment) {
		const fn = <FunctionValue>{
			body: node.body,
			name: node.name,
			type: "function",
			parameters: node.parameters,
			environment: this.environment,
		};

		scope.assign(<AssignmentExpression>{
			value: fn,
			constant: false,
			identifier: fn.name,
			kind: "assignmentExpression",
		});

		return MK_NULL();
	}
}
