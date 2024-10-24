/** @type {import('prettier').Config} */
module.exports = {
  endOfLine: 'lf',
  importOrder: [
    '^(react$)|^(react/(.*)$)',
    '^(next$)|^(next/(.*)$)',
    '<THIRD_PARTY_MODULES>',
    '^@/config/(.*)$',
    '^@/hooks/(.*)$',
    '^@/lib/(.*)$',
    '^@/schemas(.*)$',
    '^@/types/(.*)$',
    '^@/app/(.*)$',
    '^@/components/(.*)$',
    '^@/styles/(.*)$',
    '^[./]'
  ],
  importOrderCaseInsensitive: true,
  importOrderParserPlugins: ['decorators-legacy', 'jsx', 'typescript'],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  jsxSingleQuote: true,
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  printWidth: 140,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false
}
