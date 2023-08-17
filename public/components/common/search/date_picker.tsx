/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiButton, EuiSuperDatePicker, EuiFlexGroup, EuiFlexItem, EuiToolTip } from '@elastic/eui';
import { IDatePickerProps } from './search';
import { uiSettingsService } from '../../../../common/utils';
import { coreRefs } from '../../../framework/core_refs';

export function DatePicker(props: IDatePickerProps) {
  const { startTime, endTime, handleTimePickerChange, handleTimeRangePickerRefresh } = props;
  const fixedStartTime = 'now-40y';
  const fixedEndTime = 'now';

  const handleTimeChange = (e: any) => {
    if (coreRefs.llm_enabled) {
      handleTimePickerChange([e.start, e.end]);
    } else {
      handleTimePickerChange(['now-40y', 'now']);
    }
  };

  return coreRefs.llm_enabled ? (
    <EuiSuperDatePicker
      data-test-subj="pplSearchDatePicker"
      start={startTime}
      end={endTime}
      dateFormat={uiSettingsService.get('dateFormat')}
      onTimeChange={handleTimeChange}
      onRefresh={handleTimeRangePickerRefresh}
      className="osdQueryBar__datePicker"
    />
  ) : (
    <>
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiToolTip
            position="bottom"
            content="Date range has been disabled to accomodate timerange of all datasets"
          >
            <EuiSuperDatePicker
              data-test-subj="pplSearchDatePicker"
              start={fixedStartTime}
              end={fixedEndTime}
              dateFormat={uiSettingsService.get('dateFormat')}
              onTimeChange={handleTimeChange}
              onRefresh={handleTimeRangePickerRefresh}
              className="osdQueryBar__datePicker"
              showUpdateButton={false}
              isDisabled={true}
            />
          </EuiToolTip>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiButton
            iconSide="right"
            iconType="refresh"
            fill
            onClick={handleTimeRangePickerRefresh}
          >
            Refresh
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
