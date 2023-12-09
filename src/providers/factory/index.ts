/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProvider } from 'promptfoo';
import { AgentFrameworkApiProvider } from '../agent_framework';
import { PROVIDERS } from '../constants';
import { MlCommonsApiProvider } from '../ml_commons';
import { OllyApiProvider } from '../olly';
import { PPLGeneratorApiProvider } from '../ppl_generator';

type Provider = (typeof PROVIDERS)[keyof typeof PROVIDERS];

export class ApiProviderFactory {
  static create(provider: Provider = process.env.API_PROVIDER as Provider): ApiProvider {
    switch (provider) {
      case PROVIDERS.PPL_GENERATOR:
        return new PPLGeneratorApiProvider();

      case PROVIDERS.ML_COMMONS:
        return new MlCommonsApiProvider();

      case PROVIDERS.AGENT_FRAMEWORK:
        return new AgentFrameworkApiProvider();

      default:
        console.info(`$API_PROVIDER unset or invalid, defaulting to ${PROVIDERS.OLLY} provider`);
      case PROVIDERS.OLLY:
        return new OllyApiProvider();
    }
  }
}
