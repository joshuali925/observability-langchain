import React, { useState } from 'react'
import { EuiFlyout, EuiFlyoutHeader, EuiTitle, EuiFlyoutBody, EuiFlexGroup, EuiFlexItem, EuiCheckbox, EuiText, EuiButtonEmpty, EuiHorizontalRule, EuiIcon, EuiSpacer, EuiButton } from '@elastic/eui';

export default function Collab(props) {
  const [alertsChecked, setAlertsChecked] = useState(true);
  const [commentsChecked, setCommentsChecked] = useState(true);

  const renderMessage = (message, idx) => {
    return (
      <>
        <EuiHorizontalRule />
        <EuiFlexGroup justifyContent='flexEnd'>
          <EuiFlexItem grow={false}>
            <EuiIcon type={message.icon} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText>
              {message.message}
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size='s' style={{ color: 'rgb(162, 166, 172)' }}>
              {message.timestamp}
            </EuiText>
            <EuiSpacer />
            <EuiButton>
              {message.button}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  };

  const messages = [
    {
      icon: 'bell',
      message: (
        <>
          <p>Severity 2 on <b>Current rate</b></p>
          {/* <EuiSpacer size='s' /> */}
          <p>Actual: 450</p>
          {/* <EuiSpacer size='s' /> */}
          <p>{'Threshold: >= 300'}</p>
        </>
      ),
      button: 'Acknowledge',
      timestamp: '2 min ago',
    },
    {
      icon: 'editorComment',
      message: (
        <>
          <p><b>Daniel S</b> commented on <b>Resource allocation</b></p>
          {/* <EuiSpacer size='s' /> */}
          <p>Checked cluster 234521 and shifted</p>
          {/* <EuiSpacer size='s' /> */}
          <p>queue priority - should expect the</p>
          {/* <EuiSpacer size='s' /> */}
          <p>allocation back to normal</p>
        </>
      ),
      button: 'Reply',
      timestamp: '2 min ago',
    },
    {
      icon: 'bell',
      message: (
        <>
          <p>Severity 2 on <b>Resource allocation</b></p>
          {/* <EuiSpacer size='s' /> */}
          <p>Actual: field x = 10%</p>
          {/* <EuiSpacer size='s' /> */}
          <p>{'Threshold: field x < 20%'}</p>
        </>
      ),
      button: 'Acknowledge',
      timestamp: '30 min ago',
    },
  ];

  return (
    props.flyoutOpen &&
    <EuiFlyout onClose={() => props.setFlyoutOpen(false)} size='m' maxWidth={500}>
      <EuiFlyoutHeader hasBorder >
        <EuiTitle>
          <h2 style={{ fontWeight: 470 }}>Collaboration</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiCheckbox
              id='checkbox--alerts'
              label="Alerts"
              checked={alertsChecked}
              onChange={() => setAlertsChecked(!alertsChecked)}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCheckbox
              id='checkbox--comments'
              label="Comments"
              checked={commentsChecked}
              onChange={() => setCommentsChecked(!commentsChecked)}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiButtonEmpty
              size='xs'
              onClick={() => { }}
              iconType=""
              color="text"
              iconSide="right">
              <EuiText size='s'>Unread only</EuiText>
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiButtonEmpty
              size='xs'
              onClick={() => { }}
              color="text"
              iconType="arrowDown"
              iconSide="right">
              <EuiText size='s'>More filters</EuiText>
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        {messages.map((msg, idx) => {
          return renderMessage(msg, idx)

        })}

      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
