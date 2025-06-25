import { EnvValidatex, type Constraints } from "env-validatex";

const constraints: Constraints = {
  DATABASE_URL: {
    type: "string",
    required: true,
  },
  PORT: {
    type: "number",
    default: 3000,
    required: false,
  },
};

const validator = new EnvValidatex(constraints, {
  basePath: process.cwd(),
  files: [".env"],
  exitOnError: true,
  applyDefaults: true,
  silent: false,
});

validator.loadAndValidate();