// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

// Guarda-corpo da migração Expo (ver claude-prompts/expo-migration/00-PROMPT-MESTRE.txt,
// regra 3): código compartilhado (tudo em src/ exceto *.web.ts(x)) não pode importar
// react-dom/react-router-dom, CSS, nem renderizar elementos DOM (div/span/button/...).
// Arquivos *.web.tsx podem usar essas APIs quando uma capacidade web não tem equivalente
// razoável em React Native Web (regra 4) — por isso ficam fora deste bloco.
const DOM_ELEMENTS = [
  'div', 'span', 'button', 'input', 'form', 'img', 'table',
  'a', 'p', 'ul', 'li', 'section', 'header', 'footer', 'nav', 'label', 'textarea', 'select',
];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/*.web.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          { name: "react-dom", message: "react-dom é proibido em código compartilhado. Use React Native / React Native Web (regra 3)." },
          { name: "react-router-dom", message: "react-router-dom é proibido. Navegação deve usar Expo Router (regra 6)." },
        ],
        patterns: [
          { group: ["*.css", "*.css?*", "*.scss", "*.sass"], message: "CSS importado é proibido em código compartilhado (regra 3). Use src/theme e StyleSheet." },
        ],
      }],
      "react/forbid-elements": ["error", {
        forbid: DOM_ELEMENTS.map((element) => ({
          element,
          message: "elementos DOM são proibidos em código compartilhado (regra 3). Use componentes React Native (View/Text/Pressable/...).",
        })),
      }],
      "react/forbid-component-props": ["error", {
        forbid: [
          { propName: "className", message: "className é proibido em código compartilhado (regra 3). Use StyleSheet/tokens de src/theme." },
        ],
      }],
    },
  },
]);
