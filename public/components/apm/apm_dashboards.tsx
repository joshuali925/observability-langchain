import React, { useState } from 'react'
import { EuiFlexItem, EuiPanel, EuiTitle, EuiText, EuiFlexGroup, EuiSpacer, EuiFlexGrid, EuiIcon } from '@elastic/eui';
import Plt from '../visualization/plt';
import { apm_data } from '../../data/apm_data';
import FlowChart from '../visualization/flowchart';

export default function APMDashboards() {

  const renderDashboard = (data, idx, flexGrow: any = true, plot = null) => {
    return (
      <EuiFlexItem key={`apm-dashboard-${idx}`} grow={flexGrow}>
        <EuiPanel grow={true} paddingSize='s'>
          <EuiFlexGroup gutterSize='none'>
            <EuiFlexItem>
              <EuiText style={{ fontWeight: 470, fontSize: 14, marginLeft: 5 }}>
                {data.name}
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiIcon type="boxesHorizontal" onClick={() => { }} />
            </EuiFlexItem>
          </EuiFlexGroup>
          {typeof data.data === 'string' ? (
            <>
              <EuiSpacer size='s' />
              <EuiText style={{ marginLeft: 5 }}>
                <h2>{data.data}</h2>
              </EuiText>
            </>
          ) : (
              <>
                {plot || <Plt data={data.data} layout={data.layout} />}
              </>
            )}
        </EuiPanel>
      </EuiFlexItem>
    );
  };


  return (
    <>
      <EuiFlexGrid columns={4} style={{ margin: 10 }}>
        {apm_data.slice(0, 8).map((data, idx) => (
          renderDashboard(data, idx)
        ))}
      </EuiFlexGrid>
      <EuiFlexGroup style={{ margin: 10 }}>
        {renderDashboard(apm_data[8], 8, 4)}
        {renderDashboard({ name: 'Latency across services' }, 9, 6, <FlowChart />)}
      </EuiFlexGroup>
      <EuiFlexGroup style={{ margin: 10 }}>
        {renderDashboard(apm_data[9], 9)}
      </EuiFlexGroup>
    </>
  )
}
