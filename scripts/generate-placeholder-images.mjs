/**
 * Generates clean studio-style placeholder product images (public/images/products/*.png).
 * They only exist so the demo catalog looks good until real photography is uploaded
 * from Admin → Products. Run: node scripts/generate-placeholder-images.mjs
 */
import sharp from "sharp";

const COLORS = {
  black: "#1c1c1f",
  white: "#f2f1ee",
  beige: "#d9c8b4",
  gray: "#9ca3af",
  brown: "#6e5846",
};
const RIB = { black: "#0d0d0f", white: "#d6d4cf", beige: "#c2b098", gray: "#808792", brown: "#54443a" };
const darkText = (c) => ["white", "beige", "gray"].includes(c);

const shade = (id) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity=".12"/>
    <stop offset=".45" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".18"/>
  </linearGradient>`;

function wrap(body, extraDefs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f1eee9"/><stop offset="1" stop-color="#d8d1c6"/>
    </linearGradient>
    <radialGradient id="floor" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    ${shade("shade")}
    ${extraDefs}
  </defs>
  <rect width="900" height="1200" fill="url(#bg)"/>
  ${body}
</svg>`;
}

function tee({ color, back = false, cropped = false, logo = "chest", wide = true }) {
  const fill = COLORS[color];
  const ink = darkText(color) ? "#1c1c1f" : "#f2f1ee";
  const bottom = cropped ? 690 : 800;
  const lift = cropped ? 165 : 105;
  const sx = wide ? 0 : 20;
  const neckDepth = back ? 215 : 262;
  const body = `M ${300 + sx} 220 L 392 188 Q 450 ${neckDepth} 508 188 L ${600 - sx} 220 L ${770 - sx} 390 L ${690 - sx} 480 L ${625 - sx} 425 L ${625 - sx} ${bottom} L ${275 + sx} ${bottom} L ${275 + sx} 425 L ${210 + sx} 480 L ${130 + sx} 390 Z`;
  const floorY = bottom + 30;
  let print = "";
  if (back && logo === "back") {
    print = `<text x="450" y="520" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="118" letter-spacing="6" fill="${ink}">TEMA</text>
             <text x="450" y="585" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="500" font-size="34" letter-spacing="22" fill="${ink}">LABEL</text>`;
  } else if (!back && logo === "chest") {
    print = `<text x="525" y="330" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="17" letter-spacing="5" fill="${ink}" opacity=".9">TEMA LABEL</text>`;
  } else if (!back && logo === "center") {
    print = `<text x="450" y="470" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="64" letter-spacing="10" fill="${ink}">TEMA</text>`;
  }
  return wrap(`
    <g transform="translate(0 ${lift})">
    <ellipse cx="450" cy="${floorY}" rx="270" ry="26" fill="url(#floor)"/>
    <path d="${body}" fill="${fill}"/>
    <path d="${body}" fill="url(#shade)"/>
    <path d="M 392 188 Q 450 ${neckDepth} 508 188" fill="none" stroke="${RIB[color]}" stroke-width="18" stroke-linecap="round"/>
    <path d="M ${275 + sx} 425 L ${275 + sx} ${bottom}" stroke="#000" stroke-opacity=".06" stroke-width="2"/>
    <path d="M 300 ${bottom - 14} L 600 ${bottom - 14}" stroke="#000" stroke-opacity=".08" stroke-width="3"/>
    ${print}
    </g>`);
}

function cap({ color }) {
  const fill = COLORS[color];
  const ink = darkText(color) ? "#1c1c1f" : "#f2f1ee";
  return wrap(`
    <g transform="translate(-20 20) scale(.92) translate(36 40)">
    <ellipse cx="470" cy="800" rx="330" ry="30" fill="url(#floor)"/>
    <path d="M 230 650 C 230 390 420 320 560 335 C 700 350 710 540 700 650 Z" fill="${fill}"/>
    <path d="M 230 650 C 230 390 420 320 560 335 C 700 350 710 540 700 650 Z" fill="url(#shade)"/>
    <path d="M 450 345 C 420 450 425 560 440 650 M 560 335 C 590 440 600 560 590 650" stroke="#000" stroke-opacity=".12" stroke-width="3" fill="none"/>
    <circle cx="500" cy="335" r="14" fill="${fill}"/><circle cx="500" cy="335" r="14" fill="#000" fill-opacity=".15"/>
    <path d="M 215 650 L 700 650 Q 790 660 800 705 Q 590 765 340 735 Q 235 712 215 650 Z" fill="${fill}"/>
    <path d="M 215 650 L 700 650 Q 790 660 800 705 Q 590 765 340 735 Q 235 712 215 650 Z" fill="#000" fill-opacity=".18"/>
    <text x="400" y="545" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="54" letter-spacing="8" fill="${ink}">TEMA</text>
    </g>`);
}

function tote({ color }) {
  const fill = COLORS[color];
  const ink = darkText(color) ? "#1c1c1f" : "#f2f1ee";
  return wrap(`
    <ellipse cx="450" cy="1040" rx="280" ry="26" fill="url(#floor)"/>
    <path d="M 340 500 C 340 250 560 250 560 500" fill="none" stroke="${fill}" stroke-width="28" stroke-linecap="round"/>
    <path d="M 340 500 C 340 250 560 250 560 500" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="28" stroke-linecap="round"/>
    <path d="M 210 480 L 690 480 L 725 1010 L 175 1010 Z" fill="${fill}"/>
    <path d="M 210 480 L 690 480 L 725 1010 L 175 1010 Z" fill="url(#shade)"/>
    <path d="M 210 520 L 690 520" stroke="#000" stroke-opacity=".1" stroke-width="3"/>
    <text x="450" y="770" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="92" letter-spacing="12" fill="${ink}">TEMA</text>
    <text x="450" y="830" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="500" font-size="28" letter-spacing="20" fill="${ink}">LABEL</text>`);
}

function beanie({ color }) {
  const fill = COLORS[color];
  const ink = darkText(color) ? "#1c1c1f" : "#f2f1ee";
  const ribs = Array.from({ length: 11 }, (_, i) => `<path d="M ${265 + i * 37} ${760 - Math.abs(5 - i) * 8} L ${265 + i * 37} 560" stroke="#000" stroke-opacity=".08" stroke-width="3"/>`).join("");
  return wrap(`
    <ellipse cx="450" cy="930" rx="290" ry="28" fill="url(#floor)"/>
    <path d="M 225 770 C 225 380 675 380 675 770 Z" fill="${fill}"/>
    <path d="M 225 770 C 225 380 675 380 675 770 Z" fill="url(#shade)"/>
    ${ribs}
    <rect x="205" y="740" width="490" height="150" rx="30" fill="${fill}"/>
    <rect x="205" y="740" width="490" height="150" rx="30" fill="#000" fill-opacity=".14"/>
    <text x="450" y="835" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="44" letter-spacing="9" fill="${ink}">TEMA</text>`);
}

function belt({ color }) {
  const fill = COLORS[color];
  const holes = Array.from({ length: 6 }, (_, i) => `<circle cx="${400 + i * 56}" cy="600" r="9" fill="#000" fill-opacity=".45"/>`).join("");
  return wrap(`
    <ellipse cx="450" cy="740" rx="380" ry="26" fill="url(#floor)"/>
    <rect x="100" y="545" width="700" height="110" rx="10" fill="${fill}"/>
    <rect x="100" y="545" width="700" height="110" rx="10" fill="url(#shade)"/>
    <path d="M 100 565 L 800 565 M 100 635 L 800 635" stroke="#fff" stroke-opacity=".12" stroke-width="2" stroke-dasharray="10 8"/>
    ${holes}
    <rect x="165" y="505" width="150" height="190" rx="22" fill="none" stroke="#c9b27c" stroke-width="22"/>
    <rect x="235" y="560" width="14" height="80" rx="7" fill="#c9b27c"/>`);
}

const specs = {
  1: [{ t: "tee", color: "black", logo: "chest" }, { t: "tee", color: "black", back: true, logo: "back" }],
  2: [{ t: "tee", color: "black", logo: "center" }, { t: "tee", color: "white", logo: "center" }],
  3: [{ t: "tee", color: "black", logo: "none" }, { t: "tee", color: "black", back: true, logo: "back" }],
  4: [{ t: "tee", color: "black", logo: "chest" }, { t: "tee", color: "gray", logo: "chest" }],
  5: [{ t: "tee", color: "black", logo: "chest" }, { t: "tee", color: "white", logo: "chest" }],
  6: [{ t: "tee", color: "black", logo: "center" }, { t: "tee", color: "black", back: true, logo: "none" }],
  7: [{ t: "tee", color: "black", logo: "none" }, { t: "tee", color: "gray", back: true, logo: "back" }],
  8: [{ t: "tee", color: "beige", logo: "chest" }, { t: "tee", color: "black", logo: "chest" }],
  9: [{ t: "tee", color: "beige", cropped: true, logo: "chest" }, { t: "tee", color: "white", cropped: true, logo: "chest" }],
  10: [{ t: "tee", color: "black", cropped: true, wide: false, logo: "chest" }, { t: "tee", color: "beige", cropped: true, wide: false, logo: "chest" }],
  11: [{ t: "tee", color: "brown", cropped: true, logo: "center" }, { t: "tee", color: "white", cropped: true, logo: "center" }],
  12: [{ t: "tee", color: "black", cropped: true, wide: false, logo: "center" }, { t: "tee", color: "black", cropped: true, wide: false, back: true, logo: "back" }],
  13: [{ t: "cap", color: "black" }, { t: "cap", color: "beige" }],
  14: [{ t: "tote", color: "black" }, { t: "tote", color: "white" }],
  15: [{ t: "beanie", color: "brown" }, { t: "beanie", color: "gray" }],
  16: [{ t: "belt", color: "black" }, { t: "belt", color: "brown" }],
};
const render = { tee, cap, tote, beanie, belt };

for (const [n, [front, hover]] of Object.entries(specs)) {
  for (const [suffix, spec] of [["", front], ["-hover", hover]]) {
    const { t, ...opts } = spec;
    const svg = render[t](opts);
    await sharp(Buffer.from(svg)).png({ palette: true, quality: 82 }).toFile(`public/images/products/product-${n}${suffix}.png`);
  }
}
console.log("done");
