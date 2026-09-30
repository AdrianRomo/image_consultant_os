// Lets `node --test` load the project's .ts files without a new dependency: TypeScript is already a devDependency,
// so it strips the types. (Node's own type stripping is not available in every build; this workstation's is not.)
// Used only by `npm test`.
import { register } from "node:module";

register("./ts-hooks.mjs", import.meta.url);
