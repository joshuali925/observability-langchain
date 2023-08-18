/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicTool } from '../../../../node_modules/langchain/tools';
import { PluginToolsFactory } from '../tools_factory/tools_factory';

import {
  getDashboardQuery,
  getDashboardTraceGroupPercentiles,
} from '../../../../public/components/trace_analytics/requests/queries/dashboard_queries';
import { swallowErrors } from '../../utils/utils';
import { handleDslRequest } from '../../../../public/components/trace_analytics/requests/request_handler';
import { coreRefs } from '../../../../public/framework/core_refs';
import {
  filtersToDsl,
  processTimeStamp,
} from '../../../../public/components/trace_analytics/components/common/helper_functions';
import core from '../../../../../../node_modules/ajv/dist/core';

export class TracesTools extends PluginToolsFactory {
  static TOOL_NAMES = {
    TRACE_GROUPS: 'Get trace groups',
    SERVICES: 'Get trace services',
  } as const;

  toolsList = [
    new DynamicTool({
      name: TracesTools.TOOL_NAMES.TRACE_GROUPS,
      description:
        'Use this to get information about each trace group. The key is the name of the trace group, the doc_count is the number of spans, the trace_count is the number of traces, the average latency is measured in milliseconds, and the error rate is the percentage of traces with errors. You can specify a start and end time, formatted in %',
      func: swallowErrors(async (startTime?: string) => this.getTraceGroupsQuery(startTime).then()),
    }),
    // new DynamicTool({
    //   name: TracesTools.TOOL_NAMES.SERVICES,
    //   description:
    //     'Use this to get information about each service in the system of traces. The key is the name of the service, the average latency is measured in milliseconds, the error rate is the percentage of spans in that service with errors, the throughput is the number of traces through that service, and the trace_count is the number of traces',
    //   func: swallowErrors(async () => this.getServicesQuery().then()),
    // }),
  ];

  public async getTraceGroupsQuery(startTime: string | undefined) {
    // const query = JSON.stringify(getDashboardQuery());
    // try {
    //   const traceGroupsResponse = await this.observabilityClient.callAsCurrentUser('search', {
    //     body: query,
    //   });

    //   console.log(traceGroupsResponse.aggregations.trace_group_name.buckets)
    //   return JSON.stringify(traceGroupsResponse.aggregations.trace_group_name.buckets)
    // } catch (error) {
    //   return 'error in running trace groups query' + error;
    // }
    const mode = 'data_prepper';
    const query = JSON.stringify(getDashboardQuery());
    startTime = startTime ? startTime : '';
    const endTime = 'now';
    const page = 'dashboard';

    const timeFilterDSL = filtersToDsl(
      mode,
      [],
      query,
      processTimeStamp(startTime, mode),
      processTimeStamp(endTime, mode),
      page,
      []
    );
    const res = handleDslRequest(
      core.http,
      timeFilterDSL,
      getDashboardTraceGroupPercentiles(mode),
      mode
    );
    console.log(res);
    return res;
  }

  // public async getServicesQuery() {
  //   // const query = JSON.stringify(getServicesQuery('data_prepper', undefined));
  //   // const query = JSON.stringify(getDashboardQuery());
  //   const filters =
  //   const DSL = filtersToDsl(
  //     mode, // data prepper or jaeger
  //     filters, //
  //     query,
  //     processTimeStamp(startTime, mode),
  //     processTimeStamp(endTime, mode),
  //     page,
  //     appConfigs
  //   );
  //   handleDslRequest(http, DSL, getServicesQuery(mode, serviceNameFilter, DSL), mode)
  //   try {
  //     const servicesResponse = await this.observabilityClient.callAsCurrentUser('search', {
  //       body: JSON.stringify(query),
  //     });
  //     // return jsonToCsv(traceGroupsResponse.body);
  //     // console.log(jsonToCsv(traceGroupsResponse.aggregations.trace_group_name.buckets))
  //     console.log(servicesResponse.aggregations.service.buckets)
  //     return JSON.stringify(servicesResponse.aggregations.service.buckets)
  //   } catch (error) {
  //     return 'error in running services query' + error;
  //   }
  // }
}
