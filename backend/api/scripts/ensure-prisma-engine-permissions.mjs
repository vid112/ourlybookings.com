import { chmod, readdir } from "node:fs/promises";
import path from "node:path";

const pnpmStore = path.resolve("node_modules", ".pnpm");

async function makeSchemaEnginesExecutable() {
  let packageDirectories;

  try {
    packageDirectories = await readdir(pnpmStore, { withFileTypes: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  const enginePackages = packageDirectories.filter(
    (entry) => entry.isDirectory() && entry.name.startsWith("@prisma+engines@"),
  );

  for (const enginePackage of enginePackages) {
    const engineDirectory = path.join(
      pnpmStore,
      enginePackage.name,
      "node_modules",
      "@prisma",
      "engines",
    );

    let engineFiles;
    try {
      engineFiles = await readdir(engineDirectory, { withFileTypes: true });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        continue;
      }
      throw error;
    }

    for (const engineFile of engineFiles) {
      if (!engineFile.isFile() || !engineFile.name.startsWith("schema-engine-")) continue;
      await chmod(path.join(engineDirectory, engineFile.name), 0o755);
    }
  }
}

await makeSchemaEnginesExecutable();
