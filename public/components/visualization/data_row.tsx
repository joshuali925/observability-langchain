import React from 'react';
import { EuiBasicTable, EuiTabbedContent, EuiText } from '@elastic/eui';
import { metadata, datalist } from '../../data/data';

export default function DataRow() {
  const columns = [];
  metadata.forEach(field => {
    columns.push(
      {
        field: field.name,
        name: field.name,
        truncateText: true,
      }
    )
  });

  const items = [];
  for (let i = 0; i < metadata[0].length; i++) {
    let row = {};
    metadata.forEach(field => {
      row = {
        ...row,
        [field.name]: `${datalist[field.name][i].toFixed(3)}ms`,
      }
    })
    items.push(row);
  }

  return (
    <EuiBasicTable
      items={items}
      rowHeader="table"
      columns={columns}
    // rowProps={getRowProps}
    // cellProps={getCellProps}
    />
  )
}
