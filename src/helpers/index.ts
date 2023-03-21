import Environment from "../environment/enviroment";
import { RuntimeValue } from "../interfaces";
import {
	MK_BOOL,
	MK_NATIVE_FN,
	MK_NULL,
	MK_NUMBER,
	MK_OBJECT,
} from "../macros";

export function setupGlobalState(env: Environment) {
	env.constants.set("null", MK_NULL());
	env.constants.set("true", MK_BOOL(true));
	env.constants.set("false", MK_BOOL(false));

	env.constants.set(
		"print",
		MK_NATIVE_FN((args, scope) => {
			for (const arg of args) {
				if (arg.type === "native-fn") console.log("() { [native-fn] }");
				else if (arg.type === "object") {
					console.log(Object.fromEntries((arg.value) as Map<string, RuntimeValue>))				
				} else {
					console.log(arg.value);
				}
			}

			return MK_NULL();
		})
	);

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
}
