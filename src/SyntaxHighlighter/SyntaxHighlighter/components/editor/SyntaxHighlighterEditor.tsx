import * as React from 'react';
import { Tab, TabList, SelectTabEvent, SelectTabData, Text, Tooltip } from '@fluentui/react-components';
import { CodeRegular, EyeRegular } from '@fluentui/react-icons';
import { useSyntaxHighlighterEditorStyles } from './SyntaxHighlighterEditor.styles';

export interface ISyntaxHighlighterEditorProps {
  highlightedHtml: string;
  code: string;
}

export const SyntaxHighlighterEditor: React.FC<ISyntaxHighlighterEditorProps> = (props) => {
  const styles = useSyntaxHighlighterEditorStyles();
  const { highlightedHtml, code } = props;
  const [selectedTab, setSelectedTab] = React.useState<string>('read');

  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value as string);
  };

  if (!highlightedHtml) {
    return null;
  }

  return (
    <div className={styles.container}>
      {selectedTab === 'edit' && (
        <Text as="pre" size={300} className={styles.codeText}>
          {code}
        </Text>
      )}
      
      {selectedTab === 'read' && (
        <div 
          className={styles.highlightedCode}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      )}

      <TabList selectedValue={selectedTab} onTabSelect={onTabSelect} className={styles.tabList}>
        <Tooltip content="View the syntax-highlighted output" relationship="label" withArrow>
          <Tab value="read" icon={<EyeRegular />}>Read</Tab>
        </Tooltip>
        <Tooltip content="View the raw source code" relationship="label" withArrow>
          <Tab value="edit" icon={<CodeRegular />}>Code</Tab>
        </Tooltip>
      </TabList>
    </div>
  );
};
