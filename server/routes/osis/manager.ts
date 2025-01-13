/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GetPipelineCommand,
  GetPipelineCommandInput,
  ListPipelinesCommand,
  OSISClient,
  UpdatePipelineCommand,
  UpdatePipelineCommandInput,
} from '@aws-sdk/client-osis';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';

export class OsisManager {
  constructor() {}

  private async getClient() {
    const stsClient = new STSClient({ region: 'us-west-2' });
    const { Credentials } = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: 'arn:aws:iam::519072602456:role/osis-neo-role',
        RoleSessionName: 'AssumeRoleSession',
      })
    );

    if (
      !(
        Credentials &&
        Credentials.AccessKeyId &&
        Credentials.SecretAccessKey &&
        Credentials.SessionToken
      )
    )
      throw new Error('No credentials');

    return new OSISClient({
      region: 'us-west-2',
      credentials: {
        accessKeyId: Credentials.AccessKeyId,
        secretAccessKey: Credentials.SecretAccessKey,
        sessionToken: Credentials.SessionToken,
      },
    });
  }

  async getPipelines() {
    const client = await this.getClient();
    const command = new ListPipelinesCommand();
    return client.send(command);
  }

  async getPipeline(params: GetPipelineCommandInput) {
    const client = await this.getClient();
    const command = new GetPipelineCommand(params);
    return client.send(command);
  }

  async updatePipeline(params: UpdatePipelineCommandInput) {
    const client = await this.getClient();
    const command = new UpdatePipelineCommand(params);
    return client.send(command);
  }
}
