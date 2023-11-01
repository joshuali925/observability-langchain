/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProvider } from 'promptfoo';
import { PROVIDERS } from '../constants';
import { MlCommonsApiProvider } from '../ml_commons';
import { OllyApiProvider } from '../olly';
import { PPLGeneratorApiProvider } from '../ppl_generator';

type Provider = (typeof PROVIDERS)[keyof typeof PROVIDERS];

export class ApiProviderFactory {
  static create(provider: Provider): ApiProvider {
    switch (provider) {
      case PROVIDERS.OLLY:
        return new OllyApiProvider();

      case PROVIDERS.PPL_GENERATOR:
        return new PPLGeneratorApiProvider();

      case PROVIDERS.ML_COMMONS:
        return new MlCommonsApiProvider();
    }
  }
}
