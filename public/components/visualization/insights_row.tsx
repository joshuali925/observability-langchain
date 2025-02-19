import React from 'react'
import { metadata } from '../../data/data';
import { EuiToken, EuiText, EuiFlexGrid, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule } from '@elastic/eui';

export default function InsightsRow() {
  const renderRow = (stat, idx=-1) => {
    return (
      <div key={`row-${idx}`}>
        {idx !== 0 && <EuiHorizontalRule margin='none' />}
        <EuiFlexGroup style={{margin: 8}}>
          <EuiFlexItem>
            <span style={{ display: 'flex' }}>
              <span style={{ marginRight: 10, marginTop: 2 }}>
                <EuiToken iconType={stat.icon} size='s' />
              </span>
              <span>
                <EuiText size="s">{stat.name}</EuiText>
              </span>
            </span>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size='xs'>Unique entries</EuiText>
            <EuiText>{stat.uniqueEntries}</EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size='xs'>Value range</EuiText>
            <EuiText>{stat.valueRange}</EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText size='xs'>Average</EuiText>
            <EuiText>{stat.average}</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }

  return (
    <div>
      {metadata.map((data, idx) =>
        renderRow(data, idx)
      )}
    </div>
  )
}
