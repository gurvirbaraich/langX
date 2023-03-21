import AST from "./library/ast";
import Lexer from "./library/lexer";
import { Interpreter } from "./environment/interpreter";

interface Props {
	readline: (message: string) => Promise<string>;
}

const ast = new AST();
const lexer = new Lexer();

export default async function main(props: Props) {
   console.log("Relp v1.0.0");

	while (true) {
      await props.readline("> ").then((i) => {
         execute(i);
      });
   }
}

export const execute = (i: string) => {
   const tokens = lexer.tokenize(i);
   const tree = ast.generateProgram(tokens);

   Interpreter.evaluate_program(tree);
}