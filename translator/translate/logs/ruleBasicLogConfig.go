// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT

package logs

import (
	"github.com/aws/amazon-cloudwatch-agent/translator"
	"github.com/aws/amazon-cloudwatch-agent/translator/context"
	"github.com/aws/amazon-cloudwatch-agent/translator/translate/agent"
)

type BasicLogConfig struct {
}

func (f *BasicLogConfig) ApplyRule(input interface{}) (returnKey string, returnVal interface{}) {
	cloudwatchlogsConfig := map[string]interface{}{}
	// add creds
	cloudwatchlogsConfig = translator.MergeTwoUniqueMaps(cloudwatchlogsConfig, agent.Global_Config.Credentials)
	cloudwatchlogsConfig[agent.RegionKey] = agent.Global_Config.Region
	cloudwatchlogsConfig[agent.RegionType] = agent.Global_Config.RegionType
	cloudwatchlogsConfig[agent.Mode] = context.CurrentContext().ShortMode()

	// Handle the OpenSearch Ingestion (OTLP) configuration
	im, ok := input.(map[string]interface{})
	if ok {
		// Check and add use_otlp if present
		if useOTLP, ok := im["use_otlp"]; ok {
			cloudwatchlogsConfig["use_otlp"] = useOTLP
		}
		
		// Check and add otlp_endpoint if present
		if otlpEndpoint, ok := im["otlp_endpoint"]; ok {
			cloudwatchlogsConfig["otlp_endpoint"] = otlpEndpoint
		}
		
		// Check and add otlp_timeout if present
		if otlpTimeout, ok := im["otlp_timeout"]; ok {
			cloudwatchlogsConfig["otlp_timeout"] = otlpTimeout
		}
	}

	returnKey = Output_Cloudwatch_Logs
	returnVal = cloudwatchlogsConfig
	return
}

func init() {
	RegisterRule("basic_log_config", new(BasicLogConfig))
}