import React, { useState } from 'react'
import DiscoverIndexPattern from './discover_index_pattern'
import DiscoverFieldSearch from './discover_field_search'
import { EuiForm, EuiFormRow, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiButtonIcon, EuiTitle, EuiToken, EuiToolTip, EuiText, EuiButton } from '@elastic/eui'

export default function SideBar(props) {
  
  const fieldIcon = (icon: string) => {
    return (
      <EuiToken
        iconType={icon}
        title={'Label'}
        size='s'
      />
    )
  }
  const fieldText = (name: string) => {
    return (
      <EuiToolTip
        position="top"
        content={name}
        delay="long"
      >
        <EuiText size="xs" style={{float:'left'}}>
          {name}
        </EuiText>
      </EuiToolTip>
    )
  }
  return (
    <>
      <DiscoverIndexPattern />
      <DiscoverFieldSearch />
      <>
        <EuiTitle size="xxxs">
          <h3>Selected fields</h3>
        </EuiTitle>
        {props.selectedFields.map((field, idx) => (
          <span key={`field-${idx}`} style={{ paddingLeft: 6, display: 'flex' }} className='dscSidebarItem'>
            <span style={{marginTop: 2}}>
              {fieldIcon(field.icon)}
            </span>
            {/* TODO: fix vertical align for field name */}
            <span style={{ marginLeft: 10 }}>
              {fieldText(field.name)}
            </span>
            <span>
              {field.name !== '_source' && true && (
                <EuiButton
                  color="danger"
                  className="dscSidebarItem__action"
                  onClick={(ev: React.MouseEvent<HTMLButtonElement>) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    props.removeField(field);
                  }}
                >
                  {"Remove"}
                </EuiButton>
              )}
            </span>
          </span>
        ))}
        <EuiTitle size="xxxs">
          <h3>Available fields</h3>
        </EuiTitle>
        {props.availableFields.map((field, idx) => (
          <div key={`field-${idx}`} style={{ paddingLeft: 6 }} className='dscSidebarItem'>
            <span>
              {fieldIcon(field.icon)}
            </span>
            {/* TODO: fix vertical align for field name */}
            <span style={{ marginLeft: 10 }}>
              {fieldText(field.name)}
            </span>
            <span>
              {field.name !== '_source' && true && (
                <EuiButton
                  className="dscSidebarItem__action"
                  fill
                  size="s"
                  onClick={(ev: React.MouseEvent<HTMLButtonElement>) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    props.addField(field);
                  }}
                >
                  {'Add'}
                </EuiButton>
              )}
            </span>
          </div>
        ))}
      </>
    </>
  )
}
