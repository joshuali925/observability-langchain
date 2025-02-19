import React, { useState } from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTitle, EuiButton, EuiHorizontalRule, EuiText } from '@elastic/eui';
import SideBar from '../side_bar/side_bar';
import Table from './table';

export default function Events(props) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [iconHover, setIconHover] = useState(false);

  const toggleSideBar = () => {
    setIsSideBarOpen(!isSideBarOpen);
  };

  const iconStyle = iconHover ? { cursor: "pointer" } : { opacity: 0.4 };
  const iconClass = "kuiIcon fa-chevron-circle-" + (isSideBarOpen ? "left" : "right");

  return (
    <EuiFlexGroup style={{ padding: 5 }} gutterSize='s'>
      {isSideBarOpen &&
        <EuiFlexItem grow={false}>
          <SideBar selectedFields={props.selectedFields} availableFields={props.availableFields} setSelectedFields={props.setSelectedFields} setAvailableFields={props.setAvailableFields} addField={props.addField} removeField={props.removeField} />
        </EuiFlexItem>
      }
      <EuiFlexItem grow={false} style={{ width: 5 }}>
        <span className={iconClass} onClick={toggleSideBar} style={{ padding: 5, marginLeft: -9, ...iconStyle }} onMouseEnter={() => setIconHover(!iconHover)} onMouseLeave={() => setIconHover(!iconHover)}></span>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiPanel grow={false}>
          <EuiFlexGroup gutterSize='s'>
            <EuiFlexItem>
              <EuiTitle size='s'>
                <h2>Events</h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton iconSide='right' iconType='arrowDown'>Actions</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton>Customize Fields</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton fill>Export to dashboard</EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiHorizontalRule margin='s' />
          {Object.keys(props.response).length > 0 ? (
            <Table response={props.response} />
          ) : (
              <EuiText>Type a query in the search bar then press enter.</EuiText>
            )}
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}
