import * as React from 'react';
import { Textarea, Button, Badge, makeStyles, tokens } from '@fluentui/react-components';
import { Copy24Regular } from '@fluentui/react-icons';
import { usePcfContext } from '../services/PcfContextService/PcfContext';
import { SettingsDrawer } from './drawers/SettingsDrawer';

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
  textarea: {
    width: '100%',
    minHeight: '200px',
    fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
    fontSize: tokens.fontSizeBase300,
    border: 'none',
    ':hover': {
      border: 'none',
    },
    ':focus-within': {
      border: 'none',
      outline: 'none',
    },
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
  const [showLineNumbers, setShowLineNumbers] = React.useState<boolean>(true);
  const [showCopyButton, setShowCopyButton] = React.useState<boolean>(true);
  const [lineHighlights, setLineHighlights] = React.useState<boolean>(false);
  const [lineHighlightsOnHover, setLineHighlightsOnHover] = React.useState<boolean>(false);
  const [lineBlurring, setLineBlurring] = React.useState<boolean>(false);

  // Update local state when PCF field value changes
  React.useEffect(() => {
    setValue(fieldValue);
  }, [fieldValue]);

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

  const handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = ev.target.value;
    setValue(newValue);
    
    // Notify parent component if callback provided
    if (props.onChange) {
      props.onChange(newValue);
    }
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(value);
  };

  const handleBadgeClick = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const isDisabled = pcfContext.isControlDisabled() || !pcfContext.canEditField();
  const isReadOnly = !pcfContext.canReadField();

  if (isReadOnly) {
    return <div>You do not have permission to view this field</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
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
        {showCopyButton && (
          <Button
            appearance="subtle"
            icon={<Copy24Regular />}
            onClick={handleCopy}
            title="Copy to clipboard"
            size="small"
          />
        )}
      </div>
      <Textarea
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        disabled={isDisabled}
        rows={5}
        placeholder="Enter code here..."
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
