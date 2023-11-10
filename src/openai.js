import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const sampleResponse = {
  title: "String",
  response: [
    {
      rsp_header: "String",
      rsp_body: "String",
    },
  ],
  date: "String",
  location: "String",
};

class AssistantManager {
  constructor() {
    this.assistant = null;
    this.threadId = null;
  }


  async createAssistant() {
    try {
      console.log("Setting up gpt-4-1106-preview ...\n");
      this.assistant = await openai.beta.assistants.create({
        name: "Inspector Gadget",
        instructions:
          "You are a natural language processing model specilalised in business analytics." +
          " You will be given potential business details in a JSON format." +
          " Respond to any user statement with a JSON object, no matter what the user says. You can modify the response format a bit, but try to stick to the format below.\n\n" +
          JSON.stringify(sampleResponse, null, 2) +
          "\n\n",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4-1106-preview",
      });

      // Create a thread for the assistant
      this.threadId = (await openai.beta.threads.create()).id;

      return this.assistant;
    } catch (error) {
      console.error("Failed to create assistant:", error);
      return null;
    }
  }

  async askAssistant(userQuestion) {
    if (!this.assistant) {
      console.error("Assistant not initialized.");
      return;
    }

    try {
      console.log(`\nUSER: ${userQuestion}`);

      await openai.beta.threads.messages.create(this.threadId, {
        role: "user",
        content: userQuestion,
      });

      const run = await openai.beta.threads.runs.create(this.threadId, {
        assistant_id: this.assistant.id,
      });

      let runStatus = await openai.beta.threads.runs.retrieve(
        this.threadId,
        run.id
      );

      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        runStatus = await openai.beta.threads.runs.retrieve(
          this.threadId,
          run.id
        );
      }

      const messages = await openai.beta.threads.messages.list(this.threadId);
      const lastMessageForRun = messages.data
        .filter(
          (message) => message.run_id === run.id && message.role === "assistant"
        )
        .pop();

      if (lastMessageForRun) {
        console.log(`${lastMessageForRun.content[0].text.value} \n`);
        return lastMessageForRun.content[0].text.value;
      }
    } catch (error) {
      console.error("An error occurred while asking the assistant:", error);
    }
  }
}

export default AssistantManager;
