import * as React from 'react';
import { Button, Badge, makeStyles, tokens, Tooltip } from '@fluentui/react-components';
import { Copy24Regular, Settings24Regular } from '@fluentui/react-icons';
import { bundledThemes, createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';
import { usePcfContext } from '../services/PcfContextService/PcfContext';
import { SettingsDrawer } from './drawers/SettingsDrawer';
import { SyntaxHighlighterEditor } from './editor/SyntaxHighlighterEditor';
import { DialogConfirmationCopy } from './dialogs/DialogConfirmationCopy';
import { getEditorLanguage } from '../utils/languages';

// Create highlighter instance at module level (shared across all control instances)
let highlighterInstance: Highlighter | null = null;
const highlighterPromise = createHighlighter({
  themes: [],
  langs: [],
}).then((h) => {
  highlighterInstance = h;
  return h;
});

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    gap: tokens.spacingVerticalS,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  languageBadge: {
    textTransform: 'uppercase',
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    cursor: 'pointer',
    ':hover': {
      opacity: 0.8,
    },
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
});

export interface ISyntaxHighlighterControlProps {
  onChange?: (value: string) => void;
  language?: string;
  theme?: string;
}

export const SyntaxHighlighterControl: React.FC<ISyntaxHighlighterControlProps> = (props) => {
  const styles = useStyles();
  const pcfContext = usePcfContext();
  
  // Get the field value from PCF context
  const fieldValue = pcfContext.context.parameters.syntaxHiglightedField?.raw ?? '';
  
  const [value, setValue] = React.useState<string>(fieldValue);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [language, setLanguage] = React.useState<string>(props.language ?? 'markdown');
  const [theme, setTheme] = React.useState<string>(props.theme ?? 'dark-plus');
  const [showLineNumbers, setShowLineNumbers] = React.useState<boolean>(false);
  const [showCopyButton, setShowCopyButton] = React.useState<boolean>(true);
  const [lineHighlights, setLineHighlights] = React.useState<boolean>(false);
  const [lineHighlightsOnHover, setLineHighlightsOnHover] = React.useState<boolean>(false);
  const [lineBlurring, setLineBlurring] = React.useState<boolean>(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = React.useState<string>('#ffffff');
  const [foregroundColor, setForegroundColor] = React.useState<string>('#000000');
  const [highlightedHtml, setHighlightedHtml] = React.useState<string>('');

  // Update local state when PCF field value changes
  React.useEffect(() => {
    // Convert escaped newlines (\n as text) to actual newlines if needed
    let processedValue = fieldValue.includes('\\n') && !fieldValue.includes('\n') 
      ? fieldValue.replace(/\\n/g, '\n')
      : fieldValue;
    
    // Auto-format JSON if language is json and content is valid JSON
    if (language === 'json' && processedValue.trim()) {
      try {
        const parsed: unknown = JSON.parse(processedValue);
        processedValue = JSON.stringify(parsed, null, 2);
      } catch {
        // Not valid JSON or already formatted, keep as-is
      }
    }
    
    setValue(processedValue);
    console.log('Field value:', processedValue);
    console.log('Number of lines:', (processedValue.match(/\n/g) ?? []).length + 1);
  }, [fieldValue, language]);

  // Update language when prop changes (e.g., when syntaxHighlighterDefaultLanguage changes)
  React.useEffect(() => {
    if (props.language) {
      setLanguage(props.language);
    }
  }, [props.language]);

  // Update theme when prop changes (e.g., when syntaxHighlighterDefaultTheme changes)
  React.useEffect(() => {
    if (props.theme) {
      setTheme(props.theme);
    }
  }, [props.theme]);

  // Load theme colors from Shiki when theme changes
  React.useEffect(() => {
    const loadThemeColors = async () => {
      try {
        if (theme && bundledThemes[theme as keyof typeof bundledThemes]) {
          const themeModule = await bundledThemes[theme as keyof typeof bundledThemes]();
          // bundledThemes returns a module with 'default' property containing the theme
          const themeData = 'default' in themeModule ? themeModule.default : themeModule;
          // Access colors safely with explicit type checking
          const colors = (themeData as { colors?: Record<string, string> }).colors;
          const bgColor = colors?.['editor.background'] ?? '#ffffff';
          const fgColor = colors?.['editor.foreground'] ?? '#000000';
          setBackgroundColor(bgColor);
          setForegroundColor(fgColor);
        }
      } catch (error) {
        console.error('Failed to load theme colors:', error);
        // Fallback to default colors
        setBackgroundColor('#ffffff');
        setForegroundColor('#000000');
      }
    };
    void loadThemeColors();
  }, [theme]);

  // Generate syntax-highlighted HTML when value, language, or theme changes
  React.useEffect(() => {
    const generateHighlightedCode = async () => {
      try {
        // Wait for highlighter to be initialized
        const highlighter = await highlighterPromise;
        
        if (!value) {
          setHighlightedHtml('');
          return;
        }

        // Get the editor language (handles special cases like 'ansi' -> 'shellscript')
        const editorLang = getEditorLanguage(language);
        
        // Load the language if not already loaded
        const loadedLanguages = highlighter.getLoadedLanguages();
        if (!loadedLanguages.includes(editorLang)) {
          await highlighter.loadLanguage(editorLang as BundledLanguage);
        }
        
        // Load the theme if not already loaded
        const loadedThemes = highlighter.getLoadedThemes();
        if (!loadedThemes.includes(theme)) {
          await highlighter.loadTheme(theme as BundledTheme);
        }

        // Generate highlighted HTML
        const html = highlighter.codeToHtml(value, {
          lang: editorLang,
          theme: theme,
        });
        
        setHighlightedHtml(html);
      } catch (error) {
        console.error('Failed to generate highlighted code:', error);
        // Fallback to plain text in a pre tag
        setHighlightedHtml(`<pre style="background: ${backgroundColor}; color: ${foregroundColor}; padding: 16px; border-radius: 4px; overflow-x: auto;"><code>${value}</code></pre>`);
      }
    };
    
    void generateHighlightedCode();
  }, [value, language, theme, backgroundColor, foregroundColor]);

  const handleCopy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setIsCopyDialogOpen(true);
    });
  };

  const handleBadgeClick = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const isReadOnly = !pcfContext.canReadField();

  if (isReadOnly) {
    return <div>You do not have permission to view this field</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Tooltip content="Language Selector" relationship="label" withArrow>
          <Badge 
            className={styles.languageBadge}
            appearance="filled"
            color="informative"
            onClick={handleBadgeClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBadgeClick();
              }
            }}
          >
            {language}
          </Badge>
        </Tooltip>
        <div className={styles.buttonGroup}>
          {!isReadOnly && (
            <Tooltip content="Open settings" relationship="label" withArrow>
              <Button
                appearance="subtle"
                icon={<Settings24Regular />}
                onClick={handleBadgeClick}
                size="small"
              />
            </Tooltip>
          )}
          {showCopyButton && (
            <Tooltip content="Copy to clipboard" relationship="label" withArrow>
              <Button
                appearance="subtle"
                icon={<Copy24Regular />}
                onClick={handleCopy}
                size="small"
              />
            </Tooltip>
          )}
        </div>
      </div>
      <SyntaxHighlighterEditor highlightedHtml={highlightedHtml} code={value} />
      <DialogConfirmationCopy
        open={isCopyDialogOpen}
        onClose={() => setIsCopyDialogOpen(false)}
      />
      <SettingsDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        language={language}
        theme={theme}
        showLineNumbers={showLineNumbers}
        showCopyButton={showCopyButton}
        lineHighlights={lineHighlights}
        lineHighlightsOnHover={lineHighlightsOnHover}
        lineBlurring={lineBlurring}
        onLanguageChange={setLanguage}
        onThemeChange={setTheme}
        onLineNumbersChange={setShowLineNumbers}
        onCopyButtonChange={setShowCopyButton}
        onLineHighlightsChange={setLineHighlights}
        onLineHighlightsOnHoverChange={setLineHighlightsOnHover}
        onLineBlurringChange={setLineBlurring}
      />
    </div>
  );
};
