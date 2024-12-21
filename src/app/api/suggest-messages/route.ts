import OpenAI from "openai";
import { OpenAIProvider, StreamingTextResponse } from "ai"; // Assuming "ai" is installed
import { NextResponse } from "next/server";

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the runtime environment
export const runtime = "edge";

// Define the POST function
export async function POST(req: Request) {
  try {
    // Parse the incoming request JSON to get messages
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a deserve audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What is a hobby you are recently started?|| If you could have dinner with any historical figure, who would it be?||What is a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming coversational enviroment.";
    // Create a completion request to OpenAI with streaming enabled
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      stream: true,
      max_tokens: 400,
      prompt,
    });

    // Convert the response to a stream
    const stream = OpenAIProvider(response);

    // Return the streaming text response
    return new StreamingTextResponse(stream);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json(
        {
          name,
          status,
          headers,
          message,
        },
        { status }
      );
    } else {
      console.error("An unexpected error occured", error);
      throw error;
    }
  }
}
