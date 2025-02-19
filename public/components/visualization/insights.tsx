import React, { Fragment } from 'react'
import { EuiTabbedContent } from '@elastic/eui'
import InsightsRow from './insights_row'
import DataRow from './data_row';

export default function Insights() {
  const tabs = [
    {
      id: 'field-insights--id',
      name: 'Field insights',
      content: (
        <Fragment>
          <InsightsRow />
        </Fragment>
      )
    },
    {
      id: 'sample-data--id',
      name: 'Sample data',
      content: (
        <Fragment>
          <DataRow />
        </Fragment>
      )
    },
  ]
  
  return (
    <div>
      
      <EuiTabbedContent
        tabs={tabs}
        initialSelectedTab={tabs[0]}
        size='s'
        autoFocus="selected"
        onTabClick={tab => {
          console.log('clicked tab', tab);
        }}
      />
    </div>
  )
}
