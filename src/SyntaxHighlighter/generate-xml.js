const defaultLanguages = require('./SyntaxHighlighter/defaultLanguages.json');

const codeAliases = {
  'actionscript-3': ['as3'],
  bat: ['batch'],
  berry: ['be'],
  cadence: ['cdc'],
  clojure: ['clj'],
  codeql: ['ql'],
  cpp: ['arduino'],
  csharp: ['c#', 'cs'],
  cypher: ['cql'],
  docker: ['dockerfile'],
  erlang: ['erl'],
  fsharp: ['f#', 'fs'],
  gjs: ['glimmer-js'],
  gts: ['glimmer-ts'],
  haskell: ['hs'],
  handlebars: ['hbs'],
  ini: ['properties'],
  java: ['javafx'],
  javascript: ['jscript', 'js'],
  jssm: ['fsl'],
  kusto: ['kql'],
  make: ['makefile'],
  markdown: ['md'],
  matlab: ['matlabkey'],
  narrat: ['nar'],
  nextflow: ['nf'],
  'objective-c': ['objc'],
  pascal: ['delphi'],
  powershell: ['ps', 'ps1'],
  pug: ['jade'],
  python: ['py'],
  raku: ['perl6'],
  ruby: ['rb'],
  rust: ['rs'],
  shaderlab: ['shader'],
  shellscript: ['shell', 'sh', 'git-commit', 'git-rebase'],
  sellsession: ['console'],
  stylus: ['styl'],
  typescript: ['ts'],
  vb: ['cmd'],
  viml: ['vim', 'vimscript'],
  vyper: ['vy'],
  wenyan: ['文言'],
  xml: ['coldfusion'],
  yaml: ['yml'],
};

const aliasesToRemove = Object.values(codeAliases).flat();
const result = {};

Object.keys(defaultLanguages).forEach((key) => {
  if (!aliasesToRemove.includes(key)) {
    result[key] = defaultLanguages[key];
  }
});

// Generate XML entries
Object.keys(result).sort().forEach(lang => {
  console.log(`    <value name="${lang}" display-name-key="${lang}_Display_Key">${lang}</value>`);
});
