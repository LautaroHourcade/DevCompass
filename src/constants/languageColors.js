// Colores habituales de cada lenguaje (los mismos que usa GitHub).
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00add8',
  Rust: '#dea584',
  PHP: '#4f5d95',
  Ruby: '#701516',
  Kotlin: '#a97bff',
  Swift: '#f05138',
  Dart: '#00b4ab',
  HTML: '#e34c26',
  CSS: '#663399',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Shell: '#89e051',
  PowerShell: '#012456',
  Lua: '#000080',
  Scala: '#c22d40',
  'Jupyter Notebook': '#da5b0b',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  CMake: '#da3434',
  'Objective-C': '#438eff',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  R: '#198ce7',
  MDX: '#fcb32c',
  Astro: '#ff5a03',
  Zig: '#ec915c',
}

const FALLBACK_COLOR = '#8b949e'

export function getLanguageColor(language) {
  return LANGUAGE_COLORS[language] ?? FALLBACK_COLOR
}
