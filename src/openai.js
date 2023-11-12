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
  "Please make sure you use this format: { \"title\": \"text\", \"description\": \"text\" \n }"+
  "This is what information i need and some examples with how title should look and description examples: \n"+
  "business_sustability: The company's history, established in 1926, showcases its long-standing presence in the business world, suggesting stability and reliability.\n"+
  "employee_count: With a workforce of 38,000 employees, the scale of operations and human resources can be indicative of the company's capacity and stability. \n"+
  "online_presence: A company's online presence is a good indicator of its stability and reliability. A company that has a website, social media accounts, and a blog is more likely to be stable and reliable than one that does not.\n"+
  "contact_information: A company's contact information is a good indicator of its stability and reliability. A company that has a phone number, email address, and physical address is more likely to be stable and reliable than one that does not.\n"+
  "company_type: Being a private company, certain aspects of its operations and financial data may be less transparent compared to public companies, and this could be considered in the credit assessment."
  "industry_reputation: Information about Bancpost's significant investments in electronic channels of distribution may influence its creditworthiness."+
  "Please be strict about title and description keys and return me a JSON format no bigger than this.";


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
