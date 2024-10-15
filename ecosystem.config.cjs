module.exports = {
	apps: [
		{
			name: "Utils",
			script: "dist/index.js",
			interpreter_args: "--env-file=.env"
		}
	]
}