// Components aggregator + bundle generator
// Usage:
//   As a module: const comps = require('./Components'); comps.list(); comps.requireByKey('Message/V1/Message')
//   As a script: node Components.js   -> creates Components.all.js in same folder (browser-friendly bundle)

const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const SELF = path.basename(__filename);

function walk(dir) {
  const res = [];
  const items = fs.readdirSync(dir);
  for (const it of items) {
    if (it.startsWith(".")) continue;
    const full = path.join(dir, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      res.push(...walk(full));
    } else if (stat.isFile() && it.endsWith(".js")) {
      const base = path.basename(full);
      if (full === __filename) continue;
      if (
        base === "Components.all.js" ||
        base === "Components.all.min.js" ||
        base === "Components.osd.all.min.js" ||
        base === "Components.osd.all.new.min.js"
      )
        continue;

      // 添加验证以确保文件有内容
      const content = fs.readFileSync(full, "utf8");
      if (content.trim().length === 0) {
        console.warn(`Skipping empty file: ${full}`);
        continue;
      }

      res.push(full);
    }
  }
  return res;
}

function makeId(from, filePath) {
  let rel = path.relative(from, filePath).replace(/\\/g, "/");
  if (!rel.startsWith("./") && !rel.startsWith("../")) rel = "./" + rel;
  return rel;
}

function buildMap() {
  const files = walk(rootDir);
  const map = {};
  for (const f of files) {
    const id = makeId(rootDir, f);
    // key without leading './' and without .js
    const key = id.replace(/^\.\//, "").replace(/\.js$/, "");
    map[key] = id;
  }
  return map;
}

function lazyExports(map) {
  const exportsObj = {};
  Object.keys(map).forEach((k) => {
    Object.defineProperty(exportsObj, k, {
      enumerable: true,
      configurable: false,
      get() {
        return require(path.join(rootDir, map[k]));
      },
    });
  });
  return exportsObj;
}

function generateBundle(map, outFile) {
  let out = '(function(){\n"use strict";\nvar __modules = {};\n';
  for (const [k, id] of Object.entries(map)) {
    const abs = path.join(rootDir, id.replace(/^\.\//, ""));
    let content = fs.readFileSync(abs, "utf8");
    // transform simple ESM -> CommonJS so terser can parse bundled code
    content = transformESMtoCommonJS(content);
    out +=
      "__modules[" +
      JSON.stringify(id) +
      "] = function(module, exports, require){\n" +
      content +
      "\n};\n";
  }

  out +=
    "\nvar __cache = {};\nfunction __require(id){ if(__cache[id]) return __cache[id].exports; var module = {exports:{}}; __cache[id]=module; __modules[id](module, module.exports, __require); return module.exports; }\n";

  out +=
    'var G = (typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:global));\nG.NG = G.NG || {}; G.NG.Components = G.NG.Components || {};\n';

  for (const id of Object.values(map)) {
    const key = id.replace(/^\.\//, "").replace(/\.js$/, "");
    out +=
      "G.NG.Components[" +
      JSON.stringify(key) +
      "] = __require(" +
      JSON.stringify(id) +
      ");\n";
  }

  out += "\n})();\n";

  fs.writeFileSync(outFile, out, "utf8");
}

function transformESMtoCommonJS(code) {
  let out = code;

  // import default: import X from 'mod'; -> const X = require('mod');
  out = out.replace(
    /^\s*import\s+([A-Za-z0-9_$]+)\s+from\s+['"]([^'"]+)['"];?/gm,
    "const $1 = require('$2');",
  );

  // import named: import {a, b as c} from 'mod'; -> const {a, b: c} = require('mod');
  out = out.replace(
    /^\s*import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/gm,
    function (m, names, mod) {
      const mapped = names
        .split(",")
        .map((s) => s.trim())
        .map((s) => s.replace(/\s+as\s+/, " : "))
        .join(", ");
      return `const {${mapped}} = require('${mod}');`;
    },
  );

  // import * as X from 'mod';
  out = out.replace(
    /^\s*import\s+\*\s+as\s+([A-Za-z0-9_$]+)\s+from\s+['"]([^'"]+)['"];?/gm,
    "const $1 = require('$2');",
  );

  // bare import -> require
  out = out.replace(/^\s*import\s+['"]([^'"]+)['"];?/gm, "require('$1');");

  // export default -> module.exports =
  out = out.replace(/\bexport\s+default\s+/g, "module.exports = ");

  // capture named exports for functions/classes/variables
  const names = [];
  out = out.replace(
    /^\s*export\s+function\s+([A-Za-z0-9_$]+)/gm,
    function (m, name) {
      names.push(name);
      return `function ${name}`;
    },
  );
  out = out.replace(
    /^\s*export\s+class\s+([A-Za-z0-9_$]+)/gm,
    function (m, name) {
      names.push(name);
      return `class ${name}`;
    },
  );
  out = out.replace(
    /^\s*export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)/gm,
    function (m, name) {
      names.push(name);
      return m.replace(/^\s*export\s+/, "");
    },
  );

  // export { a, b as c }
  out = out.replace(/export\s*\{([^}]+)\};?/g, function (m, list) {
    const parts = list.split(",").map((s) => s.trim());
    parts.forEach((p) => {
      const m2 = p.match(/^([A-Za-z0-9_$]+)\s+as\s+([A-Za-z0-9_$]+)/);
      if (m2) names.push(m2[2]);
      else names.push(p);
    });
    return "";
  });

  if (names.length) {
    out += "\n";
    for (const n of names) {
      out += `if (typeof ${n} !== 'undefined') module.exports['${n}'] = ${n};\n`;
    }
  }

  return out;
}

function simpleMinify(code) {
  let out = "";
  let i = 0;
  const len = code.length;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let prev = "";
  while (i < len) {
    const ch = code[i];
    const next = i + 1 < len ? code[i + 1] : "";
    if (inLineComment) {
      if (ch === "\n") {
        inLineComment = false;
        out += ch;
      }
      i++;
      prev = ch;
      continue;
    }
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i += 2;
        prev = "/";
        continue;
      }
      i++;
      prev = ch;
      continue;
    }
    if (inSingle) {
      out += ch;
      if (ch === "'" && prev !== "\\") inSingle = false;
      prev = ch;
      i++;
      continue;
    }
    if (inDouble) {
      out += ch;
      if (ch === '"' && prev !== "\\") inDouble = false;
      prev = ch;
      i++;
      continue;
    }
    if (inTemplate) {
      out += ch;
      if (ch === "`" && prev !== "\\") inTemplate = false;
      prev = ch;
      i++;
      continue;
    }

    // not in any string/comment
    if (ch === "/" && next === "/") {
      inLineComment = true;
      i += 2;
      prev = "/";
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i += 2;
      prev = "/";
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      out += ch;
      prev = ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      out += ch;
      prev = ch;
      i++;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      out += ch;
      prev = ch;
      i++;
      continue;
    }

    // collapse multiple whitespace into single space
    if (/\s/.test(ch)) {
      // preserve single newline
      if (ch === "\n") {
        out += "\n";
        prev = ch;
        i++;
        continue;
      }
      // for other whitespace, add single space if previous not whitespace
      const last = out.length ? out[out.length - 1] : "";
      if (last && /\s/.test(last)) {
        // skip
      } else {
        out += " ";
      }
      prev = ch;
      i++;
      continue;
    }

    out += ch;
    prev = ch;
    i++;
  }

  // trim
  return out.replace(/^[ \t\n]+|[ \t\n]+$/g, "");
}

const map = buildMap();

if (require.main === module) {
  // CLI: generate bundle file
  const outFile = path.join(rootDir, "Components.all.js");
  generateBundle(map, outFile);
  // also write a simple-minified version
  try {
    const raw = fs.readFileSync(outFile, "utf8");
    const mini = simpleMinify(raw);
    const minOut = path.join(rootDir, "Components.all.min.js");
    fs.writeFileSync(minOut, mini, "utf8");
    console.log("Minified bundle written to", minOut);
  } catch (e) {
    console.error("Minify failed:", e && e.message);
  }
  console.log("Bundle written to", outFile);
  process.exit(0);
} else {
  // As module: export lazy require map
  module.exports = {
    list: () => Object.keys(map),
    map: map,
    components: lazyExports(map),
    requireByKey: (key) => {
      const id = map[key];
      if (!id) throw new Error("Component not found: " + key);
      return require(path.join(rootDir, id));
    },
  };
}
