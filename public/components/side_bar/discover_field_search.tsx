// https://github.com/elastic/kibana/blob/0082ca7ad8a7af7dad79d6912e6de5ad6db3b075/src/legacy/core_plugins/kibana/public/discover/np_ready/components/sidebar/discover_field_search.tsx
import React, { useState, ReactNode, OptionHTMLAttributes } from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiFieldSearch, EuiOutsideClickDetector, EuiPopover, EuiPopoverTitle, EuiPopoverFooter, EuiSwitch, EuiFacetButton, EuiIcon, EuiForm, EuiFormRow, EuiButtonGroup, EuiSwitchEvent, EuiFieldText, EuiSelect } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

export default function DiscoverFieldSearch() {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [value, setValue] = useState('');
  const [values, setValues] = useState({
    searchable: 'any',
    aggregatable: 'any',
    type: 'any',
    missing: true,
  });

  const toggleButtons = (id: string) => {
    return [
      {
        id: `${id}-any`,
        label: 'any',
      },
      {
        id: `${id}-true`,
        label: 'yes',
      },
      {
        id: `${id}-false`,
        label: 'no',
      },
    ];
  };

  const select = (
    id: string,
    selectOptions: Array<{ text: ReactNode } & OptionHTMLAttributes<HTMLOptionElement>>,
    selectValue: string
  ) => {
    return (
      <EuiSelect
        id={`${id}-select`}
        options={selectOptions}
        value={selectValue}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          handleValueChange(id, e.target.value)
        }
        aria-label={i18n.translate('kbn.discover.fieldChooser.filter.fieldSelectorLabel', {
          defaultMessage: 'Selection of {id} filter options',
          values: { id },
        })}
        data-test-subj={`${id}Select`}
        compressed
      />
    );
  };

  const handleValueChange = (name: string, filterValue: string | boolean) => {
    const previousValue = values[name];
    updateFilterCount(name, previousValue, filterValue);
    const updatedValues = { ...values };
    updatedValues[name] = filterValue;
    setValues(updatedValues);
    // applyFilterValue(name, filterValue);
  };
  const isFilterActive = (name: string, filterValue: string | boolean) => {
    return name !== 'missing' && filterValue !== 'any';
  };
  const updateFilterCount = (
    name: string,
    previousValue: string | boolean,
    currentValue: string | boolean
  ) => {
    const previouslyFilterActive = isFilterActive(name, previousValue);
    const filterActive = isFilterActive(name, currentValue);
    const diff = Number(filterActive) - Number(previouslyFilterActive);
    setActiveFiltersCount(activeFiltersCount + diff);
  };
  const types = ['string'];
  const typeOptions = types
    ? types.map(type => {
      return { value: type, text: type };
    })
    : [{ value: 'any', text: 'any' }];

  const handleMissingChange = (e: EuiSwitchEvent) => {
    const missingValue = e.target.checked;
    handleValueChange('missing', missingValue);
  };

  const buttonGroup = (id: string, legend: string) => {
    return (
      <EuiButtonGroup
        legend={legend}
        options={toggleButtons(id)}
        idSelected={`${id}-${values[id]}`}
        onChange={optionId => handleValueChange(id, optionId.replace(`${id}-`, ''))}
        buttonSize="compressed"
        isFullWidth
        data-test-subj={`${id}ButtonGroup`}
      />
    );
  };

  return (
    <React.Fragment>
      <EuiFieldSearch
        compressed
        fullWidth
        onChange={event => setValue(event.currentTarget.value)}
        placeholder={'Search field names'}
        value={value}
      />
      <EuiOutsideClickDetector onOutsideClick={() => { }} isDisabled={!isPopoverOpen}>
        <EuiPopover
          anchorPosition="downLeft"
          display="block"
          isOpen={isPopoverOpen}
          closePopover={() => {
            setPopoverOpen(false);
          }}
          button={(
            <EuiFacetButton
              icon={<EuiIcon type="filter" />}
              className="dscFieldSearch__toggleButton"
              isSelected={activeFiltersCount > 0}
              quantity={activeFiltersCount}
              onClick={() => { setPopoverOpen(!isPopoverOpen) }}
            >
              Filter by type
            </EuiFacetButton>
          )}
        >
          <EuiPopoverTitle>Filter by type</EuiPopoverTitle>
          <div className="dscFieldSearch__formWrapper" style={{ width: 265 }}>
            <EuiForm>
              <EuiFormRow fullWidth label={"Aggregatable"} display="columnCompressed">
                {buttonGroup('aggregatable', 'Aggregatable')}
              </EuiFormRow>
              <EuiFormRow fullWidth label={"Searchable"} display="columnCompressed">
                {buttonGroup('searchable', 'Searchable')}
              </EuiFormRow>
              <EuiFormRow fullWidth label={"Type"} display="columnCompressed">
                {select('type', typeOptions, values.type)}
              </EuiFormRow>
            </EuiForm>
          </div>
          <EuiPopoverFooter>
            <EuiSwitch
              label={'Hide missing fields'}
              checked={values.missing}
              onChange={handleMissingChange}
              data-test-subj="missingSwitch"
            />
          </EuiPopoverFooter>
        </EuiPopover>
      </EuiOutsideClickDetector>
    </React.Fragment>
  )
}
