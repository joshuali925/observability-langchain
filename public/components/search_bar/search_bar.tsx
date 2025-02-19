import { EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiSuperDatePicker, EuiText, EuiButtonEmpty } from '@elastic/eui';
import React, { useState } from 'react';
import { fetchSoon } from './fetch_results';
import LanguageSwitcher from './language_switcher';
import renderSavedQueries from './saved_query_management_component';

export default function SearchBar(props) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('SQL');

  const renderLanguageSwitcher = () => {
    return (
      <LanguageSwitcher language={language} setLanguage={setLanguage} />
    )
  };

  return (
    <div style={{ marginTop: 10, marginBottom: 5, marginLeft: 5 }}>
      <EuiFlexGroup
        gutterSize="s"
        justifyContent="flexEnd"
      >
        <EuiFlexItem>
          <EuiFieldText
            placeholder='Search'
            value={query}
            fullWidth
            autoComplete="off"
            spellCheck={false}
            onKeyPress={(e) => {
              let code = e.keyCode || e.which;
              if (code === 13) {  // enter pressed
                fetchSoon(query, language, props.setResponse);
              }
            }}
            type="text"
            role="textbox"
            onChange={(e) => { setQuery(e.target.value) }}
            prepend={renderSavedQueries()}
            append={renderLanguageSwitcher()}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSuperDatePicker
            showUpdateButton={false}
            onTimeChange={(e) => console.log(e)}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      {props.noFilter || (
        <EuiButtonEmpty style={{ marginTop: 10 }} size='xs' onClick={() => {}}>
          + Add filter
        </EuiButtonEmpty>
      )}
    </div>
  )
}

