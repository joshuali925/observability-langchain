import { i18n } from '@kbn/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  InsightsDiscoverPluginSetup,
  InsightsDiscoverPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME, PLUGIN_ID } from '../common';

export class InsightsDiscoverPlugin
  implements Plugin<InsightsDiscoverPluginSetup, InsightsDiscoverPluginStart> {
  public setup(core: CoreSetup): InsightsDiscoverPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'insightsDiscover',
      title: PLUGIN_NAME,
      /* icon: `plugins/${PLUGIN_ID}/assets/icon.svg`, */
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    // Return methods that should be available to other plugins
    return {
      getGreeting() {
        return i18n.translate('insightsDiscover.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: PLUGIN_NAME,
          },
        });
      },
    };
  }

  public start(core: CoreStart): InsightsDiscoverPluginStart {
    const basePath = `${core.http.basePath.get()}/app/${PLUGIN_ID}#`;
    core.chrome.setBreadcrumbs([
      {
        text: 'Insights',
        href: basePath,
      },
      {
        text: 'APM',
        href: `${basePath}/apm`,
      },
    ])
    return {};
  }

  public stop() {}
}
