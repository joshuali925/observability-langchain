import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface InsightsDiscoverPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InsightsDiscoverPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
