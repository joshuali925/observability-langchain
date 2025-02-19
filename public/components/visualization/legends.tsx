import React, { Fragment, useState } from 'react'
import { EuiButtonEmpty, EuiBadge, EuiIcon, EuiBadgeGroup, EuiSpacer } from '@elastic/eui'

export default function Legends(props) {
  const [showAreaChart, setShowAreaChart] = useState(true);
  const [showLineChart, setShowLineChart] = useState(true);
  
  const renderBadge = (field, idx = -1) => {
    return (
      <EuiBadge
        key={`badge-${idx}`}
        color="#f5f5f5"
        iconType="cross"
        iconSide="right"
        iconOnClick={() => props.removeField(field)}
        iconOnClickAriaLabel=''
      >
        <EuiIcon type="dot" color={field.color} />
        {field.name}
      </EuiBadge>
    )
  }

  return (
    <Fragment>
      <div>
        <EuiButtonEmpty
          size="s"
          color='text'
          onClick={() => setShowAreaChart(!showAreaChart)}
          iconType={showAreaChart ? "arrowDown" : "arrowUp"}
          iconSide="right">
          Area chart
        </EuiButtonEmpty>
      </div>
      {showAreaChart &&
        <EuiBadgeGroup gutterSize="s">
          {props.selectedFields.filter((field) => field.type === 'area').map((field, idx) => renderBadge(field, idx))}
        </EuiBadgeGroup>
      }
      <EuiSpacer />
      <div>
        <EuiButtonEmpty
          size="s"
          color='text'
          onClick={() => setShowLineChart(!showLineChart)}
          iconType={showLineChart ? "arrowDown" : "arrowUp"}
          iconSide="right">
          Line chart
        </EuiButtonEmpty>
      </div>
      {showLineChart &&
        <EuiBadgeGroup gutterSize="s">
          {props.selectedFields.filter((field) => field.type === 'line').map((field, idx) => renderBadge(field, idx))}
        </EuiBadgeGroup>
      }
      <EuiSpacer />
      <div>
        <EuiButtonEmpty>
          + Add a layer
        </EuiButtonEmpty>
      </div>
    </Fragment>
  )
}
