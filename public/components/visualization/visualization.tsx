import React, { useState } from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiText, EuiTitle, EuiButton, EuiSpacer, EuiHorizontalRule, EuiButtonEmpty, EuiCodeBlock, EuiCode } from '@elastic/eui'
import SideBar from '../side_bar/side_bar'
import Plt from './plt';
import { sampleLogData, layout } from '../../data/data';
import Insights from './insights';
import Legends from './legends';

export default function Visualization(props) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [iconHover, setIconHover] = useState(false);

  const toggleSideBar = () => {
    setIsSideBarOpen(!isSideBarOpen);
  };

  const iconStyle = iconHover ? { cursor: "pointer" } : { opacity: 0.4 };
  const iconClass = "kuiIcon fa-chevron-circle-" + (isSideBarOpen ? "left" : "right");
  const data = sampleLogData(props.selectedFields);

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
                <h2>Visualization</h2>
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
          <EuiCode>
            Response time last 24 hours |
          </EuiCode>
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <Plt data={data.data} title={data.title} layout={layout} />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <Legends selectedFields={props.selectedFields} availableFields={props.availableFields} setSelectedFields={props.setSelectedFields} setAvailableFields={props.setAvailableFields} removeField={props.removeField} />
            </EuiFlexItem>
          </EuiFlexGroup>
          <Insights />
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}
