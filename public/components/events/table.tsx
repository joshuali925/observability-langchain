import React from 'react'
import { EuiBasicTable, EuiTabbedContent, EuiText } from '@elastic/eui'

export default function Table(props) {
  console.log(props.response)
  
  const columns = [
    {
      field: 'index',
      name: 'Index',
      sortable: true,
      width: '100px',
    },
    {
      field: '_source',
      name: '_source',
      sortable: true,
      truncateText: false,
    },
  ];

  const items = [];

  props.response.datarows.slice(0, 100).forEach((row, idx) => {
    const stringbuilder = [];

    if (row.row)  // fix PPL bug TODO remove after upgraded PPL
      row = row.row;
    row.forEach((field, i) => {
      const data = typeof field === 'string' ? field : JSON.stringify(field);
      stringbuilder.push(`${props.response.schema[i].name}:`, data);
    });
    items.push({
      index: idx,
      _source: stringbuilder.join(' '),
    })
  });

  const renderTable = () => {
    return (
      <EuiBasicTable
        items={items}
        rowHeader="row header"
        columns={columns}
      // rowProps={getRowProps}
      // cellProps={getCellProps}
      />
    )
  };

  const tabs = [
    {
      id: 'table--id',
      name: 'Table',
      content: (
        <>
          {renderTable()}
        </>
      )
    },
    {
      id: 'raw-json--id',
      name: 'Raw JSON',
      content: (
        <>
          <div><pre>{JSON.stringify(props.response, null, 2)}</pre></div>
        </>
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
          // console.log('clicked tab', tab);
        }}
      />
    </div>
  )
}