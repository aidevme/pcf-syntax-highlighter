import { makeStyles, tokens } from '@fluentui/react-components';

export const useSyntaxHighlighterEditorStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  tabList: {
    marginTop: tokens.spacingVerticalM,
  },
  highlightedCode: {
    width: '100%',
    borderRadius: '4px',
    overflow: 'auto',
    '& pre': {
      margin: 0,
      padding: '16px',
      fontSize: tokens.fontSizeBase300,
      fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      whiteSpace: 'pre',
      lineHeight: '1.5',
    },
    '& code': {
      fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      display: 'block',
    },
    '& .line': {
      display: 'block',
      minHeight: '1em',
    },
  },
  codeText: {
    display: 'block',
    width: '100%',
    padding: '16px',
    fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '4px',
    backgroundColor: tokens.colorNeutralBackground2,
    overflowX: 'auto',
  },
});
