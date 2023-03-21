import { exit } from "process";
import { TokenKind } from "../enums";
import {
	AssignmentExpression,
	AssignmentLiteral,
	BinaryExpression,
	CallExpression,
	FunctionDeclaration,
	IdentifierLiteral,
	MemberExpression,
	Node,
	NumbericLiteral,
	ObjectLiteral,
	Program,
	PropertyLiteral,
	StringicLiteral,
	Token,
} from "../interfaces";

export default class AST {
	private tokens: Token[] = new Array<Token>();

	private shiftCurrentToken(): Token {
		return this.tokens.shift();
	}

	private returnCurrentToken(): Token {
		return this.tokens[0];
	}

	private EOF() {
		return this.returnCurrentToken().type === TokenKind.EOF;
	}

	generateProgram(tokens: Token[]) {
		this.tokens = tokens;

		const program = <Program>{
			body: [],
			kind: "program",
		};

		while (!this.EOF()) {
			program.body.push(this.parse_stmt());
		}

		return program;
	}

	private parse_stmt(): Node {
		switch (this.returnCurrentToken().type) {
			case TokenKind.Final: {
				this.shiftCurrentToken(); // Remove the final keyword

				const mut = this.shiftCurrentToken();
				this.expect(mut.type, TokenKind.Mut);

				return this.getAssignmentExpression(true);
			}

			case TokenKind.Mut: {
				this.shiftCurrentToken(); // Remove the final keyword
				return this.getAssignmentExpression();
			}

			case TokenKind.Fn: {
				this.shiftCurrentToken();
				return this.parse_fn_declaration();
			}

			default:
				return this.parse_expression();
		}
	}

	private parse_expression(): Node {
		return this.parse_object_expression();
	}

	private parse_object_expression(): Node {
		if (this.returnCurrentToken().type !== TokenKind.OpenBrace) {
			return this.parse_additive_expression();
		}

		// console.log(this.tokens)
		this.shiftCurrentToken();
		const properites = new Array<PropertyLiteral>();

		while (
			!this.EOF() &&
			this.returnCurrentToken().type !== TokenKind.CloseBrace
		) {
			/**
			 * CASES
			 * - { key: value }
			 * - { key: value, }
			 *
			 * - { key }
			 * - { key, }
			 */

			const key = this.shiftCurrentToken();
			this.expect(key.type, TokenKind.Identifier);

			/**
			 * { key, }
			 */
			if (this.returnCurrentToken().type === TokenKind.Comma) {
				this.shiftCurrentToken(); // Ignore the comma

				properites.push(<PropertyLiteral>{
					key: key.value,
					kind: "propertyLiteral",
				});

				continue;
			} else if (this.returnCurrentToken().type === TokenKind.CloseBrace) {
				/**
				 * { key }
				 */
				properites.push(<PropertyLiteral>{
					key: key.value,
					kind: "propertyLiteral",
				});

				continue;
			}

			/**
			 * At this point we have handled both the shorthands, which means this time there will be a colon
			 *
			 * { key: value }
			 */
			this.expect(this.shiftCurrentToken().type, TokenKind.Colon);

			/**
			 * At this point we have would be left will all after the colon
			 *
			 * -> { sum: (5 + 6) * 3
			 * -> (5 + 6) * 3
			 */
			const value = this.parse_expression();

			properites.push(<PropertyLiteral>{
				value: value,
				key: key.value,
				kind: "propertyLiteral",
			});

			if (this.returnCurrentToken().type !== TokenKind.CloseBrace) {
				this.expect(this.shiftCurrentToken().type, TokenKind.Comma);
			}
		}

		this.expect(this.shiftCurrentToken().type, TokenKind.CloseBrace);

		return <ObjectLiteral>{
			kind: "objectLiteral",
			properites: properites,
		};
	}

	private parse_additive_expression(): Node {
		let LHS: Node = this.parse_multiplicative_expression();

		while (
			this.returnCurrentToken().value === "+" ||
			this.returnCurrentToken().value === "-"
		) {
			const opreator = this.shiftCurrentToken().value;
			const RHS = this.parse_multiplicative_expression();

			LHS = <BinaryExpression>{
				LHS: LHS,
				RHS: RHS,
				opreator: opreator,
				kind: "binaryExpression",
			};
		}

		return LHS;
	}

	private parse_multiplicative_expression(): Node {
		let LHS: Node = this.parse_call_member_expression();

		while (
			this.returnCurrentToken().value === "*" ||
			this.returnCurrentToken().value === "/" ||
			this.returnCurrentToken().value === "%"
		) {
			const opreator = this.shiftCurrentToken().value;
			const RHS = this.parse_call_member_expression();

			LHS = <BinaryExpression>{
				LHS: LHS,
				RHS: RHS,
				opreator: opreator,
				kind: "binaryExpression",
			};
		}

		return LHS;
	}

	private parse_call_member_expression(): Node {
		/**
		 * foo.bar()
		 *
		 * - Memeber -> foo.bar
		 */
		const memeber = this.parse_member_expression();

		if (this.returnCurrentToken().type === TokenKind.OpenParan) {
			return this.parse_call_expression(memeber);
		}

		return memeber;
	}

	/**
	 * foo(a, b, c, d)()
	 *
	 * {
	 * 	kind: "callExpression",
	 *    arguments: [
	 * 		{ kind: "identifierLiternal", value: "a" },
	 * 		{ kind: "identifierLiternal", value: "b" },
	 * 		{ kind: "identifierLiternal", value: "c" },
	 * 		{ kind: "identifierLiternal", value: "d" },
	 * 	]
	 * 	caller: Node
	 * }
	 */
	private parse_call_expression(caller: Node): Node {
		let call_expression = <CallExpression>{
			caller: caller,
			kind: "callExpression",
			arguments: this.parse_arguments(),
		};

		/**
		 * Parsing the caller recursively
		 */
		if (this.returnCurrentToken().type === TokenKind.OpenParan)
			call_expression = <CallExpression>(
				this.parse_call_expression(call_expression)
			);

		this.expect(this.shiftCurrentToken().type, TokenKind.CloseParan);

		return call_expression;
	}

	private parse_arguments(): Node[] {
		if (this.returnCurrentToken().type === TokenKind.OpenParan) {
			this.shiftCurrentToken();
		}

		const args: Array<Node> =
			this.returnCurrentToken().type === TokenKind.CloseParan
				? []
				: this.parse_arguments_list();

		return args;
	}

	private parse_arguments_list(): Node[] {
		/**
		 * Getting the first argument
		 *
		 * - Example
		 * -- foo(a, b) -> [a]
		 */

		const args = [this.parse_expression()];

		/**
		 * - Until current token is not a comma
		 * - Ignoring the current token -> ,
		 */
		while (this.returnCurrentToken().type === TokenKind.Comma) {
			this.shiftCurrentToken();
			args.push(this.parse_expression());
		}

		return args;
	}

	/**
	 * Presidence of order
	 *
	 * Object
	 * Additive
	 * Multiplicative
	 * Caller
	 * Member
	 * Primary
	 */
	private parse_member_expression(): Node {
		let object = this.parse_primary_expression();

		while (
			this.returnCurrentToken().type === TokenKind.Dot ||
			this.returnCurrentToken().type === TokenKind.OpenBracket
		) {
			let property: Node;
			let computed: boolean;

			if (this.returnCurrentToken().type === TokenKind.Dot) {
				this.shiftCurrentToken();
				computed = false;
				const token = this.returnCurrentToken();
				property = this.parse_primary_expression();

				if (property.kind !== "identifierLiteral") {
					console.error(
						`Unexpected Syntax Error: Unexpected token ${token.type}`
					);
				}
			} else if (this.returnCurrentToken().type === TokenKind.OpenBracket) {
				this.shiftCurrentToken();
				computed = true;
				property = this.parse_expression();

				this.expect(this.shiftCurrentToken().type, TokenKind.CloseBracket);
			}

			object = <MemberExpression>{
				object: object,
				computed: computed,
				property: property,
				kind: "memberExpression",
			};
		}

		return object;
	}

	private expect(t: TokenKind, e: TokenKind) {
		if (t !== e) {
			console.error(
				`Unexpected Syntax Error: Expected ${e}, but got ${t}`,
				"\n"
			);

			exit(0);
		}
	}

	private getAssignmentExpression(c: boolean = false): Node {
		// parsing identifier
		const identifier = this.shiftCurrentToken();
		this.expect(identifier.type, TokenKind.Identifier);

		// Ignoring Equals sign
		const equals = this.shiftCurrentToken();
		this.expect(equals.type, TokenKind.AssignmentOpreator);

		// value
		const value = this.parse_expression();

		return <AssignmentExpression>{
			constant: c,
			value: value,
			kind: "assignmentExpression",
			identifier: identifier.value,
		};
	}

	private parse_primary_expression(): Node {
		const token = this.shiftCurrentToken();

		switch (token.type) {
			case TokenKind.Number: {
				return <NumbericLiteral>{
					kind: "numbericLiteral",
					value: Number(token.value),
				};
			}

			case TokenKind.String: {
				return <StringicLiteral>{
					value: eval(`'${token.value}'`),
					kind: "stringicLiteral",
				};
			}

			case TokenKind.Identifier: {
				const nextToken = this.returnCurrentToken();

				if (nextToken.type === TokenKind.AssignmentOpreator) {
					this.shiftCurrentToken();
					const value = this.parse_expression();

					return <AssignmentLiteral>{
						value: value,
						identifier: token.value,
						kind: "assignmentLiteral",
					};
				}

				return <IdentifierLiteral>{
					value: token.value,
					kind: "identifierLiteral",
				};
			}

			case TokenKind.OpenParan: {
				const value = this.parse_expression();

				if (value.kind !== undefined) {
					const nextToken = this.shiftCurrentToken();
					this.expect(nextToken.type, TokenKind.CloseParan);
				}

				return value;
			}

			case TokenKind.EOF: {
				console.error("Unexpected Syntax Error: Unexpected End of file.");
				exit(1);
			}

			default: {
				console.error(
					`Unexpected Syntax Error: Unrecognized token ${token.type}`
				);
				exit(1);
			}
		}
	}

	private parse_fn_declaration(): Node {
		const identifier = this.parse_primary_expression();
		this.shiftCurrentToken();

		const params: string[] = [];
		const args = this.parse_arguments();

		for (const arg of args) {
			if (arg.kind !== "identifierLiteral") {
				console.error(
					"Unexpected Syntax Error: Unexpected expression, Expected identifier"
				);
				exit(1);
			}

			params.push((<IdentifierLiteral>arg).value);
		}

		this.expect(this.shiftCurrentToken().type, TokenKind.CloseParan);
		this.expect(this.shiftCurrentToken().type, TokenKind.OpenBrace);

		const body: Node[] = new Array<Node>();

		while (
			!this.EOF() &&
			this.returnCurrentToken().type !== TokenKind.CloseBrace
		) {
			body.push(this.parse_stmt());
		}

		this.expect(this.shiftCurrentToken().type, TokenKind.CloseBrace);

		return <FunctionDeclaration>{
			body: body,
			parameters: params,
			name: identifier.value,
			kind: "functionDeclaration",
		};
	}
}
