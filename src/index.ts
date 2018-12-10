import PouchDB from 'pouchdb'
import { useState, useEffect } from 'react'

export interface CouchDocs<Content> {
  [id: string]: PouchDB.Core.ExistingDocument<Content>
}

export type PutDoc<Content> = (doc: PouchDB.Core.PutDocument<Content>) => void

export const usePouchDb = <Content = {}>(
  key: string,
  options: PouchDB.Configuration.DatabaseConfiguration,
  filter?: (doc: PouchDB.Core.ExistingDocument<Content>) => boolean
): [CouchDocs<Content>, PutDoc<Content>] => {
  const [docs, setDocs] = useState<CouchDocs<Content>>({})
  let db: PouchDB.Database<Content>

  const putDoc: PutDoc<Content> = doc => {
    if (db) {
      if (!doc._id.startsWith(key)) {
        throw new Error('Invalid doc._id')
      }
      db.put(doc)
    } else {
      console.error('putDoc() should only be called by a mounted component')
    }
  }

  useEffect(
    () => {
      db = new PouchDB(options.name, options)

      const changes = db
        .changes({
          live: true,
          include_docs: true,
          since: 'now'
        })
        .on('change', ({ doc }) => {
          if (doc._deleted) {
            delete docs[doc._id]
            setDocs(docs)
          } else if (!filter || filter(doc)) {
            docs[doc._id] = doc
            setDocs(docs)
          }
        })

      db.allDocs({
        startkey: key,
        endkey: key + '\ufff0',
        include_docs: true
      }).then(({ rows }) => {
        setDocs(
          rows.reduce((docs, { doc }) => {
            if (!filter || filter(doc)) {
              docs[doc._id] = doc
            }
            return docs
          }, {})
        )
      })

      return () => {
        changes.cancel()
        db.close()
        db = null
      }
    },
    [key, options]
  )

  return [docs, putDoc]
}
