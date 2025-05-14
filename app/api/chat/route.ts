import OpenAI from "openai";
// import { OpenAIStream, StreamingTextResponse } from 'ai'
import { DataAPIClient } from "@datastax/astra-db-ts"
// import { NextResponse } from "next/server";
import { streamText } from "ai";
import { openai as openAIModel } from '@ai-sdk/openai'

const { 
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
 } = process.env

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE})

 export async function POST(req: Request) {
    try {
        const { messages } = await req.json()
        const latestMessge = messages[messages?.length - 1]?.content

        let docContext = ""

        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessge,
            encoding_format: "float"
        })

        try {
            const collection = await db.collection(ASTRA_DB_COLLECTION)
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding.data[0].embedding,
                },
                limit: 10
            })

            const documents = await cursor.toArray()

            const docsMap = documents?.map(doc => doc.text)

            docContext = JSON.stringify(docsMap)
        } catch (err) {
            console.log("Error querying db...")
            docContext = ""
        }

        const systemPrompt = {
            role: "system",
            content: `
            You are an AI assistant designed to help users explore the impact of the Limitless campaign 
            — a global initiative empowering youth to address climate and environmental challenges. 
            You specialize in summarizing and visualizing qualitative insights from thousands of community-generated transcripts.
            Use the context below to enhance your responses with real voices and lived experiences 
            shared through community-generated transcripts sourced from the Limitless platform. 
            These transcripts reflect on-the-ground efforts, creative solutions, and personal narratives 
            from changemakers around the world.
            
            Answer the questions based on the context but use your existing knowledge to draw insights from it 
            and don't mention the source of your information or what the context does or doesn't include.
            Your response should be conversational, helpful, and grounded in the voices of the community members, 
            and formatted in an engaging and easy-to-read way.
        
            Key Instructions:
            - Provide well-structured markdown responses with headings and subheadings.
            - Present examples clearly with bullet points.
            - Use bold to highlight key points and individuals.
            - Break down complex answers into digestible sections (e.g., key themes, examples, and takeaways).
            - Avoid excessive jargon and make the information accessible.

            Your responses should be well-structured with appropriate formatting (e.g., bullet points, line breaks, headings).

            Key Instructions:
            - Answer questions in a conversational, clear, and engaging manner.
            - Break down answers into digestible sections (e.g., key themes, examples).
            - Use **bold** for important names or terms.
            - Use \n for line breaks and bullet points for examples.

            When users ask questions about climate-related issues, regions, solutions, or youth perspectives, 
            respond with well-structured markdown text that highlights:
            - Key themes or clusters (with brief summaries)
            - Powerful quotes or examples from community members
            - Visual summaries where necessary (such as charts or graphs)
            - Anything else you might consider worthy to note

            You may also guide users toward further insights, related questions, or ways to explore the impact by region or issue. 
            Format responses using markdown where applicable.
            Do not return images. If the user asks for a visualization, describe or present it using appropriate text-based formats or summary tables.
            ----------------
            START CONTEXT
            ${docContext}
            END CONTEXT
            ----------------
            QUESTION: ${latestMessge}
            ----------------
            `
        }

        // const response = await openai.chat.completions.create({
        //     model: "gpt-4",
        //     messages: [systemPrompt, ...messages]
        // });

        // const responseText = response.choices[0]?.message?.content || "";
        // console.log(responseText)
        // return NextResponse.json({ result: responseText });

        const stream = await streamText({
            model: openAIModel.chat('gpt-4'),
            messages: [systemPrompt, ...messages]
        });

        return new Response(stream.toDataStream());
        
    } catch (err) {
        throw err
    }
 }