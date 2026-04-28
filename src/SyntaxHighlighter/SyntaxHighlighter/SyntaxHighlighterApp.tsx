import * as React from 'react';
import { IdPrefixProvider, FluentProvider, webLightTheme } from "@fluentui/react-components";
import { PcfContextProvider } from "./services/PcfContextService/PcfContext";
import { PcfContextService } from "./services/PcfContextService/PcfContextService";
import { SyntaxHighlighterControl } from './components/SyntaxHighlighter';
import { IInputs } from './generated/ManifestTypes';

export interface ISyntaxHighlighterAppProps {
  context: ComponentFramework.Context<IInputs>;
  instanceid: string;
  configurationParameters?: string | null;
}

export class SyntaxHighlighterApp extends React.Component<ISyntaxHighlighterAppProps> {
  public render(): React.ReactNode {

    // Create the context service.
    const pcfContextService = new PcfContextService({
      context: this.props.context,
      instanceid: this.props.instanceid,
      configurationParameters: this.props.configurationParameters
    });

    // Use the PCF context theme (works in both runtime and design mode)
    const theme = pcfContextService.theme;

    // Don't render the control if it's not visible
    if (!pcfContextService.isVisible()) {
      return null;
    }

    // Get the language and theme from context service
    const language = pcfContextService.getDefaultLanguage();
    const selectedTheme = pcfContextService.getDefaultTheme();

    return (
      <PcfContextProvider pcfcontext={pcfContextService}>
        <FluentProvider theme={webLightTheme}>
          <IdPrefixProvider value={`app-${this.props.instanceid}-`}>
            <SyntaxHighlighterControl language={language} theme={selectedTheme} />
          </IdPrefixProvider>
        </FluentProvider>
      </PcfContextProvider>
    )
  }
}
