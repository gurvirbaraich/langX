const fs = require("fs");
const main = require("./src/main");
const { createInterface } = require("node:readline/promises");
const path = require("path");

if (process.argv.length === 2) {
	const readlineInterface = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const readline = (message) => {
		return readlineInterface.question(message, (i) => i);
	};

	main.default({ readline });
} else if (process.argv.length >= 3) {
	const file = process.argv[2];

	fs.readFile(path.join(__dirname, file), "utf8", (e, d) => {
		if (e !== null) {
			console.error(e.message);
			exit(1);
		}

		main.execute(d);
	});
}
