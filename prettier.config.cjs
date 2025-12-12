module.exports = {
  semi: true,
  trailingComma: "all",
  singleQuote: false,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "avoid",
  bracketSameLine: true,
  printWidth: 1000,
  htmlWhitespaceSensitivity: "ignore",
  proseWrap: "preserve",

  plugins: [require("prettier-plugin-tailwindcss")],
  tailwindConfig: "./tailwind.config.js",
};
