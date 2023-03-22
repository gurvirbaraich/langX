import Environment from "../environment/enviroment";
import { ArrayValue, RuntimeValue } from "../interfaces";
import {
	MK_BOOL,
	MK_NATIVE_FN,
	MK_NULL,
	MK_NUMBER,
	MK_OBJECT,
	MK_STRING,
} from "../macros";

export function setupGlobalState(env: Environment) {
	env.constants.set("null", MK_NULL());
	env.constants.set("true", MK_BOOL(true));
	env.constants.set("false", MK_BOOL(false));

	{
		const displayObject = (arg) => {
			let object = {};

			const entries = Object.fromEntries(
				arg.value as Map<string, RuntimeValue>
			);

			for (const entry of Object.keys(entries)) {
				if (entries[entry].value instanceof Map) {
					object[entry] = displayObject(entries[entry]);
				}
				
				else {
					let k = entries[entry];

					if (k.type === "function") {
						// @ts-ignore
						object[entry] = `${k.type} () {}`
					}

					else {
						object[entry] = k;
					}
				}
			}

			return object;
		};

		env.constants.set(
			"print",
			MK_NATIVE_FN((args, scope) => {
				for (const arg of args) {
					if (arg.type === "native-fn") console.log("() { [native-fn] }");
					else if (arg.type === "object") {
						console.log(displayObject(arg))
					} else if (arg.type === "array") {
						console.log((<ArrayValue>arg).values);
					} else {
						console.log(arg.value);
					}
				}

				return MK_NULL();
			})
		);
	}

	(() => {
		const properties: Map<string, RuntimeValue> = new Map();

		properties.set(
			"time",
			MK_NATIVE_FN((args, scope) => {
				return MK_NUMBER(Date.now());
			})
		);

		env.constants.set("date", MK_OBJECT(properties));
	})();

	{
		env.constants.set("typeof", MK_NATIVE_FN((args, scope) => {
			return MK_STRING(args[0].type)
		}));
	}

	{
		env.constants.set("Number", MK_NATIVE_FN((args, scope) => {
			if (args[0].type === "string" || args[0].type === "number") {
				return MK_NUMBER(Number(args[0].value));
			}

			console.error(`Uncaught TypeError: ${args[0].type} cannot be converted to a number`);
		}));
	}
}
