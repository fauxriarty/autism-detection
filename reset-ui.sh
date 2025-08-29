set -euo pipefail
npm rm tailwindcss @tailwindcss/postcss lightningcss lightningcss-darwin-arm64 || true
npm i -D tailwindcss@3 postcss autoprefixer

npx tailwindcss init -p

cat > tailwind.config.js <<'JS'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
JS

cat > postcss.config.js <<'JS'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
JS

mkdir -p src/app
cat > src/app/globals.css <<'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root{
  --bg: 0 0% 2%;
  --fg: 0 0% 98%;
  --card: 0 0% 6%;
  --border: 0 0% 14%;
}

html, body { height: 100%; }
body { color: hsl(var(--fg)); background: hsl(var(--bg)); }

.container { @apply mx-auto max-w-3xl px-4; }
.card { @apply rounded-2xl p-6 shadow-xl; border: 1px solid hsl(var(--border)); background: hsl(var(--card)); }
.btn { @apply inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors border; }
.btn-primary { @apply bg-white text-black border-black; }
.btn-primary:hover { @apply bg-gray-100; }
.btn-ghost { @apply bg-transparent border-transparent; }
.badge { @apply inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border; }
CSS

npm pkg set scripts.dev="next dev"
rm -rf .next
