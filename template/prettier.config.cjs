/** `.hf` templates are formatted by the Helfy formatter (the same as in the editor extension). */
module.exports = {
  printWidth: 100,
  plugins: [require.resolve("@helfy/helfy-lint/prettier")],
  overrides: [{ files: "*.hf", options: { parser: "helfy-hf" } }],
};
