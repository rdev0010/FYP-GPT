import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer"
import OpenAI from "openai"

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config"

import fs from 'fs';
import path from 'path';

const { 
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
 } = process.env

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

// Get the data
const filePath = path.join(__dirname, 'Transcripts.txt');
const fypData = fs.readFileSync(filePath, 'utf-8');

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE})

// Splitting up text into smaller chunks
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

// Creating a collection in our database
const createCollection = async() => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536,
            metric: "dot_product"
        }
    })
    console.log(res)
}

// Create vector embeddings out of our data and insert it into the database
const loadSampleData = async() => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    const chunks = await splitter.splitText(fypData)

    for await (const chunk of chunks) {
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: chunk,
            encoding_format: "float"
        })

        const vector = embedding.data[0].embedding
        const res = await collection.insertOne({
            $vector: vector,
            text: chunk
        })
        console.log(res)
    }
}

// Call the functions to create the collection and load the data
createCollection().then(() => loadSampleData())