import React, { useState } from 'react'
import { EuiButtonEmpty, EuiPopover, EuiPopoverTitle, EuiForm, EuiFormRow, EuiSwitch, EuiSelect, EuiRadioGroup } from '@elastic/eui';

export default function LanguageSwitcher(props) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const button = (
    <EuiButtonEmpty
      size="xs"
      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      className="euiFormControlLayout__append"
    >
      {props.language}
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
        Syntax options
    </EuiPopoverTitle>
      <div style={{ width: '350px' }}>
        <EuiRadioGroup
          options={[
            {
              id: 'SQL',
              label: 'SQL',
            },
            {
              id: 'PPL',
              label: 'PPL',
            }
          ]}
          idSelected={props.language}
          onChange={(id) => props.setLanguage(id)}
          legend={{
            children: 'Select query language',
          }}
        />
      </div>
    </EuiPopover>
  )
}
