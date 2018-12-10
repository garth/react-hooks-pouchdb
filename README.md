# react-hooks-pouchdb

A react hooks approach to pouchdb binding.

> Disclaimer: To use hooks a pre-release version of react 16.7 is required. Since the hooks API is subject to change, this library may or may not work with future versions of react.

## Install

```
yarn add react-hooks-pouchdb
```

or

```
npm install react-hooks-pouchdb
```

## Use The Hook

```tsx
import React from 'react'
import { usePouchDb } from 'react-hooks-pouchdb'

type Item = { name: string }
const couchDbOptions = { name: myDb }

const App: React.FunctionComponent = () => {
  // get all docs where the id starts with 'item/'
  const items = usePouchDb<Item>('item/', couchDbOptions)
  return (
    <ul>
      {items.map(item => (
        <li key={item._id}>{item.name}</li>
      ))}
    </ul>
  )
}

export default App
```
