import fs from "node:fs";

export const load = (path: string) => {
  return fs.readFileSync(path, "utf8");
};
