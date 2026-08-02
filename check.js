// 制作サンプルの一括点検
//   - noindex と「架空である」表示が入っているか
//   - 医療広告ガイドラインで問題になる表現が混ざっていないか
//   - 非日本語（ハングル・キリル等）や、日本語に紛れ込んだ英単語が残っていないか
const fs = require("fs");
const path = require("path");

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return e.name === ".git" ? [] : walk(p);
    return p.endsWith(".html") ? [p] : [];
  });
}

const NG = ["日本一", "No.1", "ナンバーワン", "最高の", "最先端", "絶対", "必ず治",
            "完治します", "痛くない治療", "完全無痛", "他院より", "どこよりも", "業界初", "唯一の"];
const FOREIGN = /[가-힣]|[Ѐ-ӿ]|[฀-๿]|[؀-ۿ]/;
// 正当に出てくる英字（ロゴのローマ字表記や病名の略語）は除外する
const OKWORD = /^(AOBANO|DENTAL|CLINIC|INTERNAL|MEDICINE|COPD|SVG|Google|Web|info|iryosagashi|online|com|jp)$/i;
// ルートの index.html は各サンプルへの案内ページで、
// 「こういう表現は使わない」という説明のために禁止語そのものを列挙している。
// 規制表現チェックの対象から外す（非日本語チェックは行う）。
const SKIP_NG = new Set(["index.html"]);

const files = walk(".").map((f) => f.split(path.sep).join("/").replace(/^\.\//, ""));
let bad = 0;

console.log("ファイル".padEnd(28) + "noindex 架空 規制表現 非日本語 英単語混入");
console.log("-".repeat(80));

for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  const body = raw
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ");

  const ng = SKIP_NG.has(f) ? [] : NG.filter((w) => body.includes(w));
  const fg = [...new Set([...body].filter((c) => FOREIGN.test(c)))];
  const latin = [...new Set(
    [...body.matchAll(/[ぁ-んァ-ヶ一-龥]\s?([A-Za-z]{3,})\s?[ぁ-んァ-ヶ一-龥]/g)]
      .map((m) => m[1]).filter((w) => !OKWORD.test(w))
  )];
  const noindex = /noindex/.test(raw);
  const banner = /制作(実績を示すため|サンプル)/.test(raw);
  const ok = !ng.length && !fg.length && !latin.length && noindex && banner;
  if (!ok) bad++;

  console.log(
    (ok ? "OK " : "NG ") + f.padEnd(25) +
    (noindex ? "  ✓  " : "  ✗  ") + (banner ? "  ✓  " : "  ✗  ") + "  " +
    (ng.length ? ng.join(",") : "0").padEnd(9) +
    (fg.length ? fg.join("") : "0").padEnd(9) +
    (latin.length ? latin.join(",") : "0")
  );
}

console.log("");
console.log(files.length + "ページ中 " + (files.length - bad) + "ページ問題なし");
process.exit(bad ? 1 : 0);
