import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// const filter_eg = JSON.stringify(JSON.parse(
//   fs.readFileSync("openai_instructions/filter_eg.json", "utf8")), null, 2
// );
// const documentation_inst = fs.readFileSync(
//   "openai_instructions/complex_search_inst.txt",
//   "utf8"
// );
const trends_instructions = "You will be given a company details via a JSON,"+
" please analyse the possile trends from its industry and description and return 2 to 4 trends formed strictly from one or two words in a json aray for future google trends analytics\n\n"+
"Please make sure you use this format: { \"trends\": \"trend1, trend2, trend3\" \n }";

const business_details_inst = "You are the best business consultant and analyst in the world. You are given a company details via a JSON,"+
" tell me about geographical presence based on data for building comercial credit scores \n\n"+
  "Please make sure you use this format: { \"keyword\": \"Elaboration of the analysis\" }"+
  "This is what information i need and an example On that the keys need to look like: \n"+
  "business_sustability:\n"+
  "employee_count: \n"+
  "online_presence:\n"+
  "contact_information: \n"+
  "company_type: \n"+
  "industry_reputation: "+
  "Please be strict about title and description keys and return me a JSON format with all 6 titles provided.";


class AssistantManager {
  constructor() {
    this.assistant = this.createAssistant();
    this.threadId = null;
  }

  async createAssistant() {
    try {
      console.log("Setting up gpt-4-1106-preview ...\n");
      this.assistant = await openai.beta.assistants.create({
        name: "Inspector Gadget",
        instructions: trends_instructions,
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

  async generate(payload) {

    const searchable = {
      "company_name": payload.company_name,
      "description": payload.long_description,
      "business_tags": payload.business_tags,
      "main_business_category": payload.main_business_category,
      "main_industry": payload.main_industry,
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: trends_instructions,
        },
        {
          role: "user",
          content:
            "Generate company trands from this details:" +
            JSON.stringify(searchable),
        },
      ],
      model: "gpt-4-1106-preview",
      response_format: { type: "json_object" },
    });
    return completion.choices[0].message.content;
  }
  async generateAuditAI(payload) {

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: business_details_inst,
        },
        {
          role: "user",
          content:
            "Analyse this company with the format that i told you:\n" +
            JSON.stringify(payload),
        },
      ],
      response_format: { type: "json_object" },
      model: "gpt-4-1106-preview",
    });
    return completion.choices[0].message.content;
  }



  // async generateComplexSearchJSON(payload) {
  //   if (!this.assistant) {
  //     console.error("Assistant not initialized.");
  //     return;
  //   }

  //   try {
  //     //create a completitotion on local assistant thread
  //     const completion = await openai.beta.assistants.complete(
  //       this.assistant.id,
  //       {
  //         prompt: payload,
  //         max_tokens: 100,
  //         temperature: 0.9,
  //         n: 1,
  //         logprobs: 10,
  //         echo: true,
  //         stop: ["\n"],
  //       }
  //     );
  //   } catch (error) {
  //     console.error("An error occurred while asking the assistant:", error);
  //   }
  // }

  async generateSearchJSON(userQuestion) {
    if (!this.assistant) {
      console.error("Assistant not initialized.");
      return;
    }

    try {
      await openai.beta.threads.messages.create(this.threadId, {
        role: "user",
        content: JSON.stringify(userQuestion),
        response_format: { type: "json_object" },
      });

      const run = await openai.beta.threads.runs.create(this.threadId, {
        assistant_id: this.assistant.id,
      });

      let runStatus = await openai.beta.threads.runs.retrieve(
        this.threadId,
        run.id
      );

      console.log("AI: ", runStatus.status);

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
