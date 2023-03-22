import { TokenKind } from "../enums";
import { Token } from "../interfaces";
import { exit } from "process";

export default class Lexer {
	private position: number = 0;

	private inQuotes: boolean = false;
	private tokens: Token[] = new Array<Token>();
	private buffer: Array<string> = new Array<string>();

	private keywords: Record<string, TokenKind> = {
		fn: TokenKind.Fn,
		let: TokenKind.Mut,
		final: TokenKind.Final,
		return: TokenKind.Return,
	};

	private getNextCharacter() {
		if (this.position >= this.buffer.length) {
			return null;
		}

		return this.buffer[this.position++];
	}

	/**
	 * - Returns true if the current character is [\s, \n, \r, \t]
	 *
	 * @param {string} character
	 * @returns {boolean}
	 */
	private isSkipable(character: string) {
		return (
			character === " " ||
			character === "\n" ||
			character === "\r" ||
			character === "\t"
		);
	}

	private isInt(character: string) {
		return (
			character === "0" ||
			character === "1" ||
			character === "2" ||
			character === "3" ||
			character === "4" ||
			character === "5" ||
			character === "6" ||
			character === "7" ||
			character === "8" ||
			character === "9"
		);
	}

	private isAlpha(character: string) {
		const characters = [
			"a",
			"b",
			"c",
			"d",
			"e",
			"f",
			"g",
			"h",
			"i",
			"j",
			"k",
			"l",
			"m",
			"n",
			"o",
			"p",
			"q",
			"r",
			"s",
			"t",
			"u",
			"w",
			"x",
			"y",
			"z",
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			"H",
			"I",
			"J",
			"K",
			"L",
			"M",
			"N",
			"O",
			"Q",
			"R",
			"S",
			"T",
			"U",
			"V",
			"W",
			"X",
			"Y",
			"Z",
			"_",
			"$",
		];

		if (typeof character === "undefined") return false;
		return characters.includes(character);
	}

	tokenize(code: string): Token[] {
		this.tokens = [];
		this.position = 0;
		this.inQuotes = false;
		this.buffer = code.split("");

		let currentWord = "";

		while (true) {
			const currentCharacter = this.getNextCharacter();

			if (!currentCharacter) break;
			else if (!this.isSkipable(currentCharacter) || this.inQuotes) {
				if (currentCharacter === "(" && !this.inQuotes) {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.OpenParan,
					});
				} else if (currentCharacter === ")" && !this.inQuotes) {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.CloseParan,
					});
				} else if (currentCharacter === "{" && !this.inQuotes) {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.OpenBrace,
					});
				} else if (currentCharacter === "}" && !this.inQuotes) {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.CloseBrace,
					});
				} else if (currentCharacter === "[" && !this.inQuotes) {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.OpenBracket,
					});
				} else if (currentCharacter === "]" && !this.inQuotes) {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.CloseBracket,
					});
				} else if (currentCharacter === ":" && !this.inQuotes) {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.Colon,
					});
				} else if (currentCharacter === "," && !this.inQuotes) {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.Comma,
					});
				} else if (currentCharacter === "." && !this.isInt(this.buffer[this.position]) && !this.inQuotes) {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.Dot,
					});
				} else if (
					currentCharacter === "+" ||
					(currentCharacter === "-" &&
						!this.inQuotes &&
						!this.isInt(this.buffer[this.position])) ||
					currentCharacter === "*" ||
					currentCharacter === "/" ||
					currentCharacter === "%"
				) {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.BinaryOpreator,
					});
				} else if (currentCharacter === "=") {
					this.tokens.push({
						value: currentCharacter,
						type: TokenKind.AssignmentOpreator,
					});
				} else if (currentCharacter === '"') {
					this.inQuotes = true;
				} else {
					if (
						(this.isInt(currentCharacter) || currentCharacter === ".") &&
						!this.inQuotes
					) {
						currentWord += currentCharacter;

						if (
							!this.isInt(this.buffer[this.position]) &&
							this.buffer[this.position] !== "." &&
							!this.inQuotes
						) {
							this.tokens.push({
								value: currentWord,
								type: TokenKind.Number,
							});

							currentWord = "";
						}
					} else {
						if (currentCharacter === "-") {
							if (this.inQuotes) {
								currentWord += currentCharacter;
							} else if (this.isInt(this.buffer[this.position])) {
								if (currentWord.includes("-")) {
									console.error("Uncaught Syntax Error: Unexpected '-'");
									exit(1);
								}

								currentWord += currentCharacter;
								currentWord += this.buffer[this.position++];
							} else {
								console.error("Uncaught Syntax Error: Unexpected '-'");
								exit(1);
							}
						} else currentWord = currentCharacter;

						while (true) {
							const nextCharacter = this.buffer[this.position];

							if (nextCharacter === undefined || nextCharacter === '"') break;

							if (!this.inQuotes) {
								if (this.isSkipable(nextCharacter)) break;
								if (!this.isAlpha(nextCharacter)) break;
							}

							currentWord += nextCharacter;
							this.position++;
						}

						if (this.keywords[currentWord] !== undefined) {
							this.tokens.push({
								value: currentWord,
								type: this.keywords[currentWord],
							});

							currentWord = "";
						} else {
							if (this.inQuotes) {
								this.inQuotes = false;

								this.position++;

								this.tokens.push({
									value: currentWord,
									type: TokenKind.String,
								});
							} else
								this.tokens.push({
									value: currentWord,
									type: currentWord.includes("-")
										? TokenKind.Number
										: TokenKind.Identifier,
								});

							currentWord = "";
						}
					}
				}
			}
		}

		this.tokens.push({
			value: "EOF",
			type: TokenKind.EOF,
		});

		return this.tokens;
	}
}
