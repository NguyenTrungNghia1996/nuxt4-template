module.exports = {
  semi: true,
  trailingComma: "all",
  singleQuote: false,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "avoid",
  bracketSameLine: true,
  printWidth: 100,
  htmlWhitespaceSensitivity: "ignore",
  proseWrap: "preserve",

  plugins: [require("prettier-plugin-tailwindcss")],
  tailwindConfig: "./tailwind.config.js"
}
