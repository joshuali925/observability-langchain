// https://github.com/elastic/kibana/blob/0082ca7ad8a7af7dad79d6912e6de5ad6db3b075/src/legacy/core_plugins/kibana/public/discover/np_ready/components/sidebar/discover_index_pattern.tsx
// https://github.com/elastic/kibana/blob/0082ca7ad8a7af7dad79d6912e6de5ad6db3b075/src/legacy/core_plugins/kibana/public/discover/np_ready/components/sidebar/change_indexpattern.tsx
import React, { useState } from 'react'
import { EuiPopover, EuiPopoverTitle, EuiSelectable, EuiButtonEmpty } from '@elastic/eui';

export default function DiscoverIndexPattern() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const createTrigger = function () {
    return (
      <EuiButtonEmpty
        className="dscIndexPattern__triggerButton"
        flush="left"
        color="text"
        iconSide="right"
        iconType="arrowDown"
        // title={"test_title"}
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      >
        {"test_label"}
      </EuiButtonEmpty>
    );
  };

  return (
    <div>
      <EuiPopover
        button={createTrigger()}
        isOpen={isPopoverOpen}
        closePopover={() => setIsPopoverOpen(false)}
        panelPaddingSize="s"
        ownFocus
      >
        <div >
          <EuiPopoverTitle>Change index pattern</EuiPopoverTitle>
          <EuiSelectable
            searchable
            singleSelection="always"
            options={[{ title: 'test_item_a', id: 'id-test_item_a' }, { title: 'test_item_b', id: 'id-test_item_b' }].map(({ title, id }) => ({
              label: title,
              key: id,
              value: id,
              checked: id === id ? 'on' : undefined,
            }))}
            onChange={choices => {
              const choice = (choices.find(({ checked }) => checked) as unknown) as {
                value: string;
              };
              setIsPopoverOpen(false);
            }}
            searchProps={{
              compressed: true,
            }}
          >
            {(list, search) => (
              <>
                {search}
                {list}
              </>
            )}
          </EuiSelectable>
        </div>
      </EuiPopover>
    </div>
  )
}
