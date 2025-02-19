import React from 'react'
import { EuiFlexItem, EuiButton, EuiButtonEmpty, EuiFlexGroup } from '@elastic/eui'


export default function TopNavMenu() {
  const items = ['New', 'Save', 'Open', 'Share', 'Inspect']

  return (
    <EuiFlexGroup
      justifyContent="flexStart"
      alignItems="center"
      gutterSize="none"
      style={{marginTop: 10, marginLeft: -3}}
      responsive={false}>
      {items.map((item: string, index: number) => (
        <EuiFlexItem grow={false} key={`nav-menu-${index}`} >
          <EuiButtonEmpty size="xs">
            {item}
          </EuiButtonEmpty>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  )
}
