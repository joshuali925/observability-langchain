import React, { useState } from 'react'
import SearchBar from '../search_bar/search_bar';
import { EuiTitle, EuiFlexGroup, EuiFlexItem, EuiButton, EuiFlexGrid, EuiText, EuiPanel, EuiFlyout, EuiFlyoutHeader, EuiFlyoutBody, EuiSpacer } from '@elastic/eui';
import APMDashboards from './apm_dashboards';
import Collab from './collab';

export default function APM() {
  const [response, setResponse] = useState({});
  const [flyoutOpen, setFlyoutOpen] = useState(false);

  return (
    <>
      <EuiFlexGroup gutterSize='s' style={{ margin: 10 }}>
        <EuiFlexItem>
          <EuiTitle><h1>APM-all-apps</h1></EuiTitle>
          <EuiSpacer size='s'/>
          <EuiText>Dashboard query: service name=* <a style={{color: 'rgb(53, 128, 190)'}}>Edit</a></EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => setFlyoutOpen(true)}>Collab</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton iconSide='right' iconType='arrowDown'>Dashboard Actions</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill>Add Panel</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <SearchBar response={response} setResponse={setResponse} />
      <APMDashboards />
      <Collab flyoutOpen={flyoutOpen} setFlyoutOpen={setFlyoutOpen} />
    </>
  )
}
