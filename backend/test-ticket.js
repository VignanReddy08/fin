import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const testTicketAI = async () => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `
      Analyze this ticket.
      Customer Name: Vignan
      Ticket Type: Refund
      Amount Involved: $15
      Description: "I need a refund for $15."
      
      You must respond ONLY with a valid JSON object matching exactly this structure:
      {
        "priority": "Low",
        "needsHumanApproval": false,
        "confidenceScore": 95,
        "reasoning": "short explanation",
        "suggestedResolution": "automated resolution text"
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: 'llama3-8b-8192',
      response_format: { type: "json_object" }
    });
    
    console.log("Raw output:", completion.choices[0]?.message?.content);
  } catch (e) {
    console.error("Groq call failed:", e);
  }
};

testTicketAI();
