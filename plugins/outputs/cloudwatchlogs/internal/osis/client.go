// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT

package osis

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sts"
	v4 "github.com/aws/aws-sdk-go/aws/signer/v4"
	"github.com/influxdata/telegraf"

	"github.com/aws/amazon-cloudwatch-agent/logs"
)

type Client struct {
	endpoint   string
	httpClient *http.Client
	region     string
	session    *session.Session
	log        telegraf.Logger
}

func NewClient(endpoint string) *Client {
	return &Client{
		endpoint: endpoint,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *Client) SetLogger(logger telegraf.Logger) {
	c.log = logger
}

func (c *Client) SetTimeout(timeout time.Duration) {
	c.httpClient.Timeout = timeout
}

func (c *Client) SetRegion(region string) {
	c.region = region
	c.session = session.Must(session.NewSession(&aws.Config{
		Region: aws.String(region),
	}))
}

func (c *Client) PublishEvents(events []logs.LogEvent) error {
	if len(events) == 0 {
		return nil
	}

	c.log.Infof("Processing %d events for OpenSearch Ingestion", len(events))

	var jsonEvents []map[string]interface{}
	for _, event := range events {
		var jsonData map[string]interface{}
		if err := json.Unmarshal([]byte(event.Message()), &jsonData); err == nil {
			if _, ok := jsonData["@timestamp"]; !ok {
				jsonData["@timestamp"] = event.Time().Format(time.RFC3339)
			}
			jsonEvents = append(jsonEvents, jsonData)
		} else {
			jsonEvents = append(jsonEvents, map[string]interface{}{
				"message":    event.Message(),
				"@timestamp": event.Time().Format(time.RFC3339),
			})
		}
	}

	payload, err := json.Marshal(jsonEvents)
	if err != nil {
		c.log.Errorf("Failed to marshal events: %v", err)
		return fmt.Errorf("failed to marshal events: %v", err)
	}

	req, err := http.NewRequest("POST", c.endpoint, bytes.NewBuffer(payload))
	if err != nil {
		c.log.Errorf("Failed to create request: %v", err)
		return fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	c.log.Infof("Signing request with AWS SigV4 for region: %s", c.region)
	
	sess := c.session
	if sess == nil {
		sess = session.Must(session.NewSession(&aws.Config{
			Region: aws.String(c.region),
		}))
	}
	
	signer := v4.NewSigner(sess.Config.Credentials)
	_, err = signer.Sign(req, bytes.NewReader(payload), "osis", c.region, time.Now())
	if err != nil {
		c.log.Errorf("Failed to sign request: %v", err)
		return fmt.Errorf("failed to sign request: %v", err)
	}

	c.log.Debugf("Sending request to OpenSearch Ingestion endpoint: %s", c.endpoint)

	startTime := time.Now()
	resp, err := c.httpClient.Do(req)
	duration := time.Since(startTime)

	if err != nil {
		c.log.Errorf("Failed to send request: %v (took %v)", err, duration)
		return fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, err := io.ReadAll(resp.Body)
		errorMessage := string(bodyBytes)
		if err != nil {
			errorMessage = fmt.Sprintf("failed to read error response: %v", err)
		}

		c.log.Errorf("Request failed with status code: %d (took %v)", resp.StatusCode, duration)
		c.log.Errorf("Error response: %s", errorMessage)

		// TODO: remove. If we get a 403 Forbidden error, try to get caller identity to help debug
		if resp.StatusCode == 403 {
			c.log.Infof("Got 403 Forbidden, checking AWS identity...")
			if sess == nil {
				sess = session.Must(session.NewSession(&aws.Config{
					Region: aws.String(c.region),
				}))
			}
			
			stsClient := sts.New(sess)
			result, err := stsClient.GetCallerIdentity(&sts.GetCallerIdentityInput{})
			if err != nil {
				c.log.Errorf("Failed to get caller identity: %v", err)
			} else {
				c.log.Infof("Current AWS identity: Account=%s, ARN=%s, UserId=%s",
					*result.Account, *result.Arn, *result.UserId)
			}
		}

		return fmt.Errorf("request failed with status code: %d - %s", resp.StatusCode, errorMessage)
	}

	c.log.Debugf("Successfully sent %d events to OpenSearch Ingestion (status: %d, took %v)",
		len(events), resp.StatusCode, duration)

	for _, event := range events {
		event.Done()
	}

	return nil
}
