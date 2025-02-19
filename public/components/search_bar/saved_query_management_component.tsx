import React, { useState, Fragment } from 'react'
import { EuiButtonEmpty, EuiIcon, EuiPopover, EuiPopoverTitle, EuiText, EuiSpacer, EuiPopoverFooter, EuiFlexGroup, EuiFlexItem, EuiButton } from '@elastic/eui';

export default function renderSavedQueries() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const button = (
    <EuiButtonEmpty
      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      title={'See saved queries'}
    >
      <EuiIcon type="save" className="euiQuickSelectPopover__buttonText" />
      <EuiIcon type="arrowDown" />
    </EuiButtonEmpty>
  );
  return (
    <EuiPopover
      ownFocus
      anchorPosition='downRight'
      button={button}
      isOpen={isPopoverOpen}
      closePopover={() => setIsPopoverOpen(false)}
      withTitle
    >
      <EuiPopoverTitle>
        Saved Queries
    </EuiPopoverTitle>
      <Fragment>
        <EuiText size="s" color="subdued" className="kbnSavedQueryManagement__text">
          <p>There are no saved queries. Save query text and filters that you want to use again.</p>
        </EuiText>
        <EuiSpacer size="s" />
      </Fragment>
      <EuiPopoverFooter>
        <EuiFlexGroup
          direction="rowReverse"
          gutterSize="s"
          alignItems="center"
          justifyContent="flexEnd"
          responsive={false}
          wrap={true}
        >
          <EuiFlexItem />
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              fill
              onClick={() => { }}
            >
              {'Save current query'}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPopoverFooter>
    </EuiPopover >
  )
}
