// Arma latest.json para tauri-plugin-updater a partir del .sig que generó
// `npm run tauri build` (bundle/nsis/*.exe.sig). Correr después del build y
// antes de subir los assets al release de GitHub.
//
// Uso: node scripts/generate-latest-json.js
//
// El asset de Windows en el release tiene que llamarse
// CuadernoSeguimiento-Setup-<version>.exe (mismo patrón que ya se usa para
// los releases existentes) para que la URL coincida.

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const tauriConf = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "src-tauri", "tauri.conf.json"), "utf8")
);
const version = tauriConf.version;

const targetDir = process.env.CARGO_TARGET_DIR
  ? process.env.CARGO_TARGET_DIR
  : path.join(repoRoot, "src-tauri", "target");
const bundleDir = path.join(targetDir, "release", "bundle");
const nsisDir = path.join(bundleDir, "nsis");

const sigFile = fs
  .readdirSync(nsisDir)
  .find((f) => f.endsWith(".exe.sig"));
if (!sigFile) {
  console.error(`No se encontró ningún *.exe.sig en ${nsisDir}. ¿Corriste "npm run tauri build" con TAURI_SIGNING_PRIVATE_KEY seteada?`);
  process.exit(1);
}
const signature = fs.readFileSync(path.join(nsisDir, sigFile), "utf8").trim();

const assetName = `CuadernoSeguimiento-Setup-${version}.exe`;
const latest = {
  version: `v${version}`,
  notes: "",
  pub_date: new Date().toISOString(),
  platforms: {
    "windows-x86_64": {
      signature,
      url: `https://github.com/manugandini53-design/manugandini53-design.github.io/releases/download/v${version}/${assetName}`,
    },
  },
};

const outFile = path.join(bundleDir, "latest.json");
fs.writeFileSync(outFile, JSON.stringify(latest, null, 2));
console.log(`Listo: ${outFile}`);
console.log(`Subí al release, junto con el instalador renombrado a "${assetName}".`);
