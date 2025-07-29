import { createContext, useContext, useState, useEffect } from 'react';

// Removed: import dotenv from 'dotenv'
// Removed: dotenv.config({ path: './.env' });

const AiContext = createContext();

export const AiProvider = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [currentComponent, setCurrentComponent] = useState(null);

  // This function is now part of the AiProvider's scope,
  // making it accessible within the generate function.
  async function callGeminiApi(messages) {
    // --- IMPORTANT NOTE ON API KEY HANDLING ---
    // In THIS CANVAS ENVIRONMENT: Leave apiKey as an empty string (`""`).
    // The Canvas runtime will automatically provide the Gemini API key at runtime.
    //
    // FOR YOUR LOCAL REACT PROJECT (e.g., using Vite or Create React App):
    // 1. Create a file named `.env` in the root of your project.
    // 2. Add your API key like this: `VITE_AI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY` (for Vite)
    //    OR `REACT_APP_AI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY` (for Create React App)
    // 3. Then, access it in your React code as shown below:

    // For Vite projects:
    const apiKey = import.meta.env.VITE_AI_API_KEY || "";
    // For Create React App (CRA) projects:
    // const apiKey = process.env.REACT_APP_AI_API_KEY || "";

    // Fallback for Canvas environment if the above lines are used locally:
    // If running in Canvas, the `apiKey` will be provided even if `import.meta.env.VITE_AI_API_KEY` is undefined.
    // This empty string allows the Canvas to inject the key.
    const finalApiKey = apiKey === undefined ? "" : apiKey;


    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${finalApiKey}`;

    const payload = {
      contents: messages,
      // temperature: 0.7, // You can adjust this value as needed
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        // Attempt to get more specific error message from the API response
        const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Check if the response structure is as expected
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        console.log("Generated Text:", text);
        return text; // Return the generated text
      } else {
        console.warn("Unexpected response structure or no content:", result);
        return null; // Or handle as appropriate for your application
      }

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error; // Re-throw to allow further error handling
    }
  }

  const generate = async (prompt, context = []) => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const systemInstruction = `You are an expert React component generator. Return:
        1. JSX code in \`\`\`jsx blocks
        2. CSS in \`\`\`css blocks
        3. Brief explanation in markdown`;

      let geminiMessages = [];

      // Start building the conversation history for Gemini API
      // The system instruction is integrated into the first user turn.
      if (context.length === 0) {
        // If no prior context, the first message is the system instruction + current prompt
        geminiMessages.push({
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\n${prompt}` }]
        });
      } else {
        // If there's context, map it to Gemini format and prepend system instruction
        // to the first user message found in the context.
        let systemInstructionPrepended = false;
        for (const msg of context) {
          const geminiRole = msg.role === 'assistant' ? 'model' : msg.role;
          let textPart = msg.content;

          if (!systemInstructionPrepended && geminiRole === 'user') {
            textPart = `${systemInstruction}\n\n${msg.content}`;
            systemInstructionPrepended = true;
          }
          geminiMessages.push({ role: geminiRole, parts: [{ text: textPart }] });
        }

        // If the context started with a 'model' message (meaning no user message to prepend to),
        // add the system instruction as a separate initial 'user' turn.
        if (!systemInstructionPrepended && geminiMessages.length > 0 && geminiMessages[0].role === 'model') {
            geminiMessages.unshift({ role: 'user', parts: [{ text: systemInstruction }] });
        } else if (!systemInstructionPrepended && geminiMessages.length === 0) {
            // This case should ideally not happen if context.length > 0, but as a fallback.
            geminiMessages.push({ role: 'user', parts: [{ text: systemInstruction }] });
        }

        // Add the current user prompt at the end of the conversation.
        // The API expects alternating roles. If the last message in geminiMessages
        // is already a 'user' message, adding another 'user' message will cause a 400 error.
        // This implies the 'context' itself might be malformed or not strictly alternating.
        // For component generation, typically the context would be previous user/model turns.
        // We append the new prompt as a 'user' turn.
        geminiMessages.push({ role: 'user', parts: [{ text: prompt }] });
      }

      // Log the messages being sent to the API for debugging purposes
      console.log("Sending to Gemini API:", JSON.stringify(geminiMessages, null, 2));

      // Call the Gemini API using the integrated function
      const content = await callGeminiApi(geminiMessages);

      if (!content) {
        throw new Error('No content received from Gemini API or content was empty.');
      }

      // Extract JSX and CSS from the response content
      const jsx = content.match(/```jsx([\s\S]*?)```/)?.[1]?.trim();
      const css = content.match(/```css([\s\S]*?)```/)?.[1]?.trim();

      if (!jsx) {
        console.warn("No JSX code found in response. Full content:", content);
        throw new Error('No JSX code found in response. Check model output format.');
      }

      const component = { jsx, css, prompt };
      setCurrentComponent(component);
      return component;
    } catch (error) {
      // Access error message directly from the error object
      setGenerationError(error.message);
      console.error("Error in generate function:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AiContext.Provider value={{
      generate,
      isGenerating,
      generationError,
      currentComponent,
      setCurrentComponent
    }}>
      {children}
    </AiContext.Provider>
  );
};

export const useAi = () => useContext(AiContext);

