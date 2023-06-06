//@ts-check
import { Client } from '@opensearch-project/opensearch';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { HuggingFaceInferenceEmbeddings } from 'langchain/embeddings/hf';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { OpenSearchVectorStore } from 'langchain/vectorstores/opensearch';
import path from 'path';

const log = (...args) => console.log(`[${new Date().toISOString()}]`, ...args);

const __dirname = path.resolve();
const indexName = process.env.OPENSEARCH_INDEX || 'documents';

const loadDocuments = async () => {
  const loader = new DirectoryLoader(__dirname + '/static_data', {
    '.json': (path) => new JSONLoader(path),
    '.csv': (path) => new CSVLoader(path),
    '.txt': (path) => new TextLoader(path),
  });
  const documents = await loader.load();

  const splitter = new CharacterTextSplitter({
    separator: '\n',
    keepSeparator: true,
    chunkSize: 1000,
    chunkOverlap: 0,
  });
  return splitter.splitDocuments(documents).then((splitted) =>
    splitted.map((doc) => {
      delete doc.metadata.loc; // text splitter adds a location field to metadata, OpenSearchVectorStore.fromDocuments doesn't add documents with this field
      return doc;
    })
  );
};

const documents = await loadDocuments();
log('Loaded documents:', JSON.stringify([documents[0]]));

const client = new Client({
  nodes: [process.env.OPENSEARCH_URL ?? 'http://localhost:9200'],
});

const exists = await client.indices.exists({ index: indexName }).then((r) => r.body);
if (exists) {
  log(`index '${indexName}' already exists, sleeping 3 seconds before deleting it`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await client.indices.delete({ index: indexName });
  log('Deleted index');
}

log('Ingesting to vector store');
const response = await OpenSearchVectorStore.fromDocuments(
  documents,
  new HuggingFaceInferenceEmbeddings(),
  {
    client,
    indexName,
  }
);
