import * as React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Button,
  makeStyles,
  tokens,
  Label,
  Switch,
  Dropdown,
  Option,
  Field,
  Checkbox,
  Text,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Input,
} from '@fluentui/react-components';
import { Dismiss24Regular, Settings24Regular } from '@fluentui/react-icons';
import { languages } from '../../utils/languages';
import { themes } from '../../utils/themes';

const useStyles = makeStyles({
  content: {
    padding: tokens.spacingVerticalM,
  },
  accordionPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  settingRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  checkboxRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  helperText: {
    marginLeft: '28px',
    color: tokens.colorNeutralForeground3,
  },
  buttonStyleSelector: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalXS,
    marginBottom: tokens.spacingVerticalS,
  },
  sizeButtonGroup: {
    display: 'flex',
    width: '100%',
    marginTop: tokens.spacingVerticalXXS,
  },
  fontFieldLabel: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalXXS,
  },
  footer: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalM,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    justifyContent: 'flex-end',
  },
});

export interface ISettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  lineHighlights?: boolean;
  lineHighlightsOnHover?: boolean;
  lineBlurring?: boolean;
  onThemeChange?: (theme: string) => void;
  onLanguageChange?: (language: string) => void;
  onLineNumbersChange?: (enabled: boolean) => void;
  onCopyButtonChange?: (enabled: boolean) => void;
  onLineHighlightsChange?: (enabled: boolean) => void;
  onLineHighlightsOnHoverChange?: (enabled: boolean) => void;
  onLineBlurringChange?: (enabled: boolean) => void;
}

export const SettingsDrawer: React.FC<ISettingsDrawerProps> = (props) => {
  const styles = useStyles();

  // Local state for pending changes
  const [localTheme, setLocalTheme] = React.useState(props.theme);
  const [localLanguage, setLocalLanguage] = React.useState(props.language);
  const [localShowLineNumbers, setLocalShowLineNumbers] = React.useState(props.showLineNumbers ?? true);
  const [localShowCopyButton, setLocalShowCopyButton] = React.useState(props.showCopyButton ?? true);
  const [localLineHighlights, setLocalLineHighlights] = React.useState(props.lineHighlights ?? false);
  const [localLineHighlightsOnHover, setLocalLineHighlightsOnHover] = React.useState(props.lineHighlightsOnHover ?? false);
  const [localLineBlurring, setLocalLineBlurring] = React.useState(props.lineBlurring ?? false);

  // Sync local state when props change or drawer opens
  React.useEffect(() => {
    if (props.isOpen) {
      setLocalTheme(props.theme);
      setLocalLanguage(props.language);
      setLocalShowLineNumbers(props.showLineNumbers ?? true);
      setLocalShowCopyButton(props.showCopyButton ?? true);
      setLocalLineHighlights(props.lineHighlights ?? false);
      setLocalLineHighlightsOnHover(props.lineHighlightsOnHover ?? false);
      setLocalLineBlurring(props.lineBlurring ?? false);
    }
  }, [props.isOpen, props.theme, props.language, props.showLineNumbers, props.showCopyButton, props.lineHighlights, props.lineHighlightsOnHover, props.lineBlurring]);

  // Sort languages alphabetically by display name
  const sortedLanguages = React.useMemo(() => {
    return Object.entries(languages).sort(([, nameA], [, nameB]) => 
      nameA.localeCompare(nameB)
    );
  }, []);

  // Sort themes alphabetically by display name
  const sortedThemes = React.useMemo(() => {
    return Object.entries(themes).sort(([, nameA], [, nameB]) => 
      nameA.localeCompare(nameB)
    );
  }, []);

  const handleThemeChange = (_: unknown, data: { optionValue?: string; optionText?: string }) => {
    if (data.optionValue) {
      setLocalTheme(data.optionValue);
    }
  };

  const handleLanguageChange = (_: unknown, data: { optionValue?: string; optionText?: string }) => {
    if (data.optionValue) {
      setLocalLanguage(data.optionValue);
    }
  };

  const handleLineNumbersChange = (_: unknown, data: { checked: boolean }) => {
    setLocalShowLineNumbers(data.checked);
  };

  const handleCopyButtonChange = (_: unknown, data: { checked: boolean }) => {
    setLocalShowCopyButton(data.checked);
  };

  const handleApply = () => {
    if (localTheme && props.onThemeChange) {
      props.onThemeChange(localTheme);
    }
    if (localLanguage && props.onLanguageChange) {
      props.onLanguageChange(localLanguage);
    }
    if (props.onLineNumbersChange) {
      props.onLineNumbersChange(localShowLineNumbers);
    }
    if (props.onCopyButtonChange) {
      props.onCopyButtonChange(localShowCopyButton);
    }
    if (props.onLineHighlightsChange) {
      props.onLineHighlightsChange(localLineHighlights);
    }
    if (props.onLineHighlightsOnHoverChange) {
      props.onLineHighlightsOnHoverChange(localLineHighlightsOnHover);
    }
    if (props.onLineBlurringChange) {
      props.onLineBlurringChange(localLineBlurring);
    }
    props.onClose();
  };

  const handleCancel = () => {
    props.onClose();
  };

  return (
    <Drawer
      type="overlay"
      separator
      open={props.isOpen}
      onOpenChange={(_, { open }) => !open && props.onClose()}
      position="end"
      size="medium"
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<Dismiss24Regular />}
              onClick={props.onClose}
            />
          }
        >
          <Settings24Regular /> Settings
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody>
        <div className={styles.content}>
          <Accordion collapsible multiple defaultOpenItems={['line-settings', 'theme', 'languages']}>
            <AccordionItem value="line-settings">
              <AccordionHeader>Line Settings</AccordionHeader>
              <AccordionPanel className={styles.accordionPanel}>
                <div className={styles.checkboxRow}>
              <Checkbox
                checked={localShowLineNumbers}
                onChange={(_, data) => setLocalShowLineNumbers(data.checked === true)}
                label="Line numbers"
              />
              <Text size={200} className={styles.helperText}>
                Enable line numbers and set a starting number.
              </Text>
            </div>

            <div className={styles.checkboxRow}>
              <Checkbox
                checked={localLineHighlights}
                onChange={(_, data) => setLocalLineHighlights(data.checked === true)}
                label="Line highlights"
              />
              <Text size={200} className={styles.helperText}>
                Highlight individual lines to bring attention to specific code.
              </Text>
            </div>

            <div className={styles.checkboxRow}>
              <Checkbox
                checked={localLineHighlightsOnHover}
                onChange={(_, data) => setLocalLineHighlightsOnHover(data.checked === true)}
                label="Line highlights on hover"
              />
              <Text size={200} className={styles.helperText}>
                Every line will be highlighted when hovered.
              </Text>
            </div>

            <div className={styles.checkboxRow}>
              <Checkbox
                checked={localLineBlurring}
                onChange={(_, data) => setLocalLineBlurring(data.checked === true)}
                label="Line blurring"
              />
              <Text size={200} className={styles.helperText}>
                Blur surrounding code to focus on specific lines.
              </Text>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="theme">
              <AccordionHeader>Theme</AccordionHeader>
              <AccordionPanel className={styles.accordionPanel}>
                <Field label="Themes">
              <Dropdown
                placeholder="Select theme"
                value={localTheme}
                selectedOptions={localTheme ? [localTheme] : []}
                onOptionSelect={handleThemeChange}
              >
                {sortedThemes.map(([themeId, themeName]) => (
                  <Option key={themeId} value={themeId}>
                    {themeName}
                  </Option>
                ))}
              </Dropdown>
                </Field>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="languages">
              <AccordionHeader>Languages</AccordionHeader>
              <AccordionPanel className={styles.accordionPanel}>
                <Field label="Language">
              <Dropdown
                placeholder="Select language"
                value={localLanguage}
                selectedOptions={localLanguage ? [localLanguage] : []}
                onOptionSelect={handleLanguageChange}
              >
                {sortedLanguages.map(([langId, langName]) => (
                  <Option key={langId} value={langId}>
                    {langName}
                  </Option>
                ))}
              </Dropdown>
                </Field>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="header-type">
              <AccordionHeader>Header Type</AccordionHeader>
              <AccordionPanel className={styles.accordionPanel}>
                <Field label="Header">
              <Dropdown placeholder="Select header type">
                <Option value="none">None</Option>
                <Option value="basic">Basic</Option>
                <Option value="extended">Extended</Option>
              </Dropdown>
                </Field>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="footer-type">
              <AccordionHeader>Footer Type</AccordionHeader>
              <AccordionPanel className={styles.accordionPanel}>
                <Field label="Footer">
              <Dropdown placeholder="Select footer type">
                <Option value="none">None</Option>
                <Option value="basic">Basic</Option>
                <Option value="extended">Extended</Option>
              </Dropdown>
                </Field>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="buttons">
              <AccordionHeader>Buttons</AccordionHeader>
              <AccordionPanel className={styles.accordionPanel}>
                <div className={styles.checkboxRow}>
                  <Checkbox label="Copy Button" />
                  <Text size={200} className={styles.helperText}>
                    Adds a button to copy the code
                  </Text>
                </div>

                <div className={styles.buttonStyleSelector}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #D1D1D1',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <rect x="4" y="4" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0078D4',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: '#E6F2FF',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" fill="none" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #D1D1D1',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <text x="10" y="14" style={{textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold'}}>A</text>
                    </svg>
                  </div>
                </div>

                <Label size="small" weight="semibold">
                  BUTTON LABEL
                </Label>
                <Input placeholder="Copy" defaultValue="Copy" />

                <div className={styles.checkboxRow}>
                  <Checkbox label="Use Textarea" />
                  <Text size={200} className={styles.helperText}>
                    Use a &lt;textarea&gt; to to store the code, otherwise a `data-code` attribute
                  </Text>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="font-styling">
              <AccordionHeader>Font Styling</AccordionHeader>
              <AccordionPanel className={styles.accordionPanel}>
                <div className={styles.settingRow}>
                  
                  <Label size="small" className={styles.fontFieldLabel}>
                    FONT SIZE
                  </Label>
                  <div className={styles.sizeButtonGroup}>
                    <div style={{
                      flex: 1,
                      padding: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #D1D1D1',
                      borderTopLeftRadius: '4px',
                      borderBottomLeftRadius: '4px',
                      borderRight: 'none',
                    }}>
                      S
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#000',
                      color: '#FFF',
                      border: '1px solid #000',
                    }}>
                      M
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #D1D1D1',
                      borderLeft: 'none',
                    }}>
                      L
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #D1D1D1',
                      borderLeft: 'none',
                      borderTopRightRadius: '4px',
                      borderBottomRightRadius: '4px',
                    }}>
                      XL
                    </div>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <Label size="small" weight="semibold" className={styles.fontFieldLabel}>
                    Line Height
                  </Label>
                 
                  <div className={styles.sizeButtonGroup}>
                    <div style={{
                      flex: 1,
                      padding: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #D1D1D1',
                      borderTopLeftRadius: '4px',
                      borderBottomLeftRadius: '4px',
                      borderRight: 'none',
                    }}>
                      S
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#000',
                      color: '#FFF',
                      border: '1px solid #000',
                    }}>
                      M
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #D1D1D1',
                      borderLeft: 'none',
                    }}>
                      L
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #D1D1D1',
                      borderLeft: 'none',
                      borderTopRightRadius: '4px',
                      borderBottomRightRadius: '4px',
                    }}>
                      XL
                    </div>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <Label size="small" className={styles.fontFieldLabel}>
                    FONT FAMILY
                  </Label>
                  <Dropdown placeholder="Select font family" defaultValue="JetBrains Mono" defaultSelectedOptions={['jetbrains']}>
                    <Option value="monospace">Monospace</Option>
                    <Option value="cascadia">Cascadia Code</Option>
                    <Option value="fira">Fira Code</Option>
                    <Option value="jetbrains">JetBrains Mono</Option>
                  </Dropdown>
                </div>

                <div className={styles.checkboxRow}>
                  <Checkbox label="Clamp Font Sizes" />
                  <Text size={200} className={styles.helperText}>
                    Check this if your font sizes are unusually large or tiny.
                  </Text>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="max-height">
              <AccordionHeader>Max Height</AccordionHeader>
              <AccordionPanel className={styles.accordionPanel}>
                <div className={styles.settingRow}>
                  <Label size="small" className={styles.fontFieldLabel}>
                    MAX EDITOR HEIGHT (ADMIN ONLY)
                  </Label>
                  <Input type="number" placeholder="0" defaultValue="0" />
                  <Text size={200} className={styles.helperText} style={{marginLeft: 0}}>
                    Set to 0 to disable.
                  </Text>
                </div>

                <div className={styles.checkboxRow}>
                  <Checkbox label="Enable frontend max height" />
                  <Text size={200} className={styles.helperText}>
                    Enable this, then select a specific line number below.
                  </Text>
                </div>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem value="extra-settings">
              <AccordionHeader>Extra Settings</AccordionHeader>
              <AccordionPanel className={styles.accordionPanel}>
                <div className={styles.checkboxRow}>
                  <Checkbox label="Disable Padding" />
                  <Text size={200} className={styles.helperText}>
                    This is useful if you pick a theme that matches your background color, and want the code to line up to the edge of your content. You can always add your own padding with CSS.
                  </Text>
                </div>

                <div className={styles.checkboxRow}>
                  <Checkbox label="Encode special characters" />
                  <Text size={200} className={styles.helperText}>
                    Select this to allow HTML entities such as &amp;lt; and &amp;gt; to be displayed. You may need to re-add the code after changing this
                  </Text>
                </div>
              </AccordionPanel>
            </AccordionItem>

            
          </Accordion>
        </div>
      </DrawerBody>

      <div className={styles.footer}>
        <Button appearance="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button appearance="primary" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </Drawer>
  );
};
