import React, { useState } from 'react'
import { EuiText, EuiPopover, EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTabbedContent } from '@elastic/eui'
import SearchBar from './search_bar/search_bar';
import TopNavMenu from './top_nav_menu';
import Visualization from './visualization/visualization';
import { metadata } from '../data/data'
import Events from './events/events';


export default function Discover() {
  const [selectedFields, setSelectedFields] = useState([...metadata]);
  const [availableFields, setAvailableFields] = useState([]);
  const [response, setResponse] = useState({});
  
  const addField = (field) => {  // available -> selected
    let removedField = null;

    let newFields = [...availableFields];
    for (let i = 0; i < newFields.length; i++) {
      if (newFields[i].name === field.name) {
        removedField = newFields.splice(i, 1)[0];
        break;
      }
    }
    setAvailableFields(newFields);

    newFields = [...selectedFields];
    newFields.push(removedField);
    newFields.sort((a, b) => a.name.localeCompare(b.name));
    setSelectedFields(newFields);
  };

  const removeField = (field) => {
    let removedField = null;

    let newFields = [...selectedFields];
    for (let i = 0; i < newFields.length; i++) {
      if (newFields[i].name === field.name) {
        removedField = newFields.splice(i, 1)[0];
        break;
      }
    }
    setSelectedFields(newFields);

    newFields = [...availableFields];
    newFields.push(removedField);
    newFields.sort((a, b) => a.name.localeCompare(b.name));
    setAvailableFields(newFields);
  };
  const tabs = [
    {
      id: 'events--id',
      name: 'Events',
      content: (
        <>
          <Events selectedFields={selectedFields} availableFields={availableFields} setSelectedFields={setSelectedFields} setAvailableFields={setAvailableFields} addField={addField} removeField={removeField} response={response} />
        </>
      )
    },
    {
      id: 'patterns--id',
      name: 'Patterns',
      content: (
        <>
        </>
      )
    },
    {
      id: 'statistics--id',
      name: 'Statistics',
      content: (
        <>
        </>
      )
    },
    {
      id: 'visualization--id',
      name: 'Visualization',
      content: (
        <>
          <Visualization selectedFields={selectedFields} availableFields={availableFields} setSelectedFields={setSelectedFields} setAvailableFields={setAvailableFields} addField={addField} removeField={removeField} />
        </>
      )
    }
  ]
  return (
    <>
      <TopNavMenu />
      <SearchBar response={response} setResponse={setResponse} />
      <EuiTabbedContent
        tabs={tabs}
        initialSelectedTab={tabs[0]}
        size='s'
        autoFocus="selected"
        onTabClick={tab => {
          // console.log('clicked tab', tab);
        }}
      />
    </>
  )
}
