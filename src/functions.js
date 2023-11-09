import OpenAI from 'openai';
// inport dotenv
import dotenv from "dotenv";
dotenv.config();


// Create a OpenAI connection
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});
const sample_response = {
  title: "String",
  response: [
    {
      rsp_header: "String",
      rsp_body: "String",
    }
  ],
  date: "String",
  location: "String",
}

async function main() {
  try {
    const assistant = await openai.beta.assistants.create({
      name: "Inspector Gadget",
      instructions:
        "You are a natural language processing model. Respond to any user statement with a JSON object, no matter what the user says. You can modify response format a bit but try to stick to the format below. \n\n" +
        JSON.stringify(sample_response, null, 2) +
        "\n\n" ,
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4-1106-preview",
    });

    // Log the first greeting
    console.log(
      "\nLoading gpt-4-1106-preview ... \n"
    );

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Use keepAsking as state for keep asking questions
    let keepAsking = true;
    while (keepAsking) {
      const userQuestion = "What is Moldova?"
      console.log(`\nUSER: ${userQuestion}`);
      // Pass in the user question into the existing thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userQuestion,
      });

      // Use runs to wait for the assistant response and then retrieve it
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );

      // Polling mechanism to see if runStatus is completed
      // This should be made more robust.
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      // Get the last assistant message from the messages array
      const messages = await openai.beta.threads.messages.list(thread.id);

      // Find the last message for the current run
      const lastMessageForRun = messages.data
        .filter(
          (message) => message.run_id === run.id && message.role === "assistant"
        )
        .pop();

      // If an assistant message is found, console.log() it
      if (lastMessageForRun) {
        console.log(`${lastMessageForRun.content[0].text.value} \n`);
      }

      // Then ask if the user wants to ask another question and update keepAsking state
      keepAsking = false;

      // If the keepAsking state is falsy show an ending message
      if (!keepAsking) {
        console.log("Noapte buna AI!\n");
      }
    }

    // close the readline
  } catch (error) {
    console.error("O murit AI-ul"+error);
  }
}

// Call the main function
main();

export default main;