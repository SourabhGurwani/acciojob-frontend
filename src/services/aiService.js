import axios from 'axios';
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'https://api.openrouter.ai/v1/chat/completions';
const AI_MODEL = import.meta.env.VITE_AI_MODEL || 'meta-llama/llama-3-70b-instruct';
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;

export const generateComponent = async (prompt, context = {}, config = {}) => {
  const {
    existingJsx = '',
    existingCss = '',
    preset = 'REACT', // REACT or MUI
    features = [], // ['tests', 'storybook', 'typescript']
    styleMethod = 'CSS Modules' // or 'Tailwind', 'Styled Components'
  } = config;

  try {
    const messages = [
      {
        role: "system",
        content: buildSystemPrompt(preset, styleMethod, features)
      },
      {
        role: "user",
        content: buildUserPrompt(prompt, existingJsx, existingCss)
      }
    ];

    const response = await axios.post(AI_API_URL, {
      model: AI_MODEL,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_AI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return parseAIResponse(response.data.choices[0].message.content);

  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error(`AI service failed: ${error.message}`);
  }
};

// Helper functions
const buildSystemPrompt = (preset, styleMethod, features) => {
  let prompt = `You are an expert ${preset === 'MUI' ? 'Material-UI' : 'React'} component generator. Rules:
1. Generate clean, production-ready code
2. Use ${preset === 'MUI' ? 'Material-UI v5+' : 'React 18+'} best practices
3. ${features.includes('typescript') ? 'Use TypeScript' : 'Use PropTypes'}
4. Style with ${styleMethod}
5. Make components accessible (a11y compliant)
6. Add JSDoc comments`;

  if (features.includes('tests')) prompt += '\n7. Include unit test boilerplate';
  if (features.includes('storybook')) prompt += '\n8. Generate Storybook stories';

  prompt += `\n\nResponse MUST be JSON with these fields:
- componentName: "PascalCaseName"
- jsx: "component code"
- css: "styles code"${features.includes('tests') ? '\n- tests: "test code"' : ''}${features.includes('storybook') ? '\n- storybook: "story code"' : ''}
- explanation: "brief description"`;

  return prompt;
};

const buildUserPrompt = (prompt, existingJsx, existingCss) => {
  if (!existingJsx && !existingCss) {
    return `Create new component with: "${prompt}"`;
  }
  return `Refine this component based on: "${prompt}"\n\nCurrent JSX:\n${existingJsx}\n\nCurrent CSS:\n${existingCss}`;
};

const parseAIResponse = (content) => {
  try {
    const result = JSON.parse(content);
    return {
      componentName: result.componentName || 'MyComponent',
      jsx: result.jsx,
      css: result.css,
      tests: result.tests || null,
      storybook: result.storybook || null,
      explanation: result.explanation || 'Component generated successfully'
    };
  } catch (e) {
    throw new Error('Invalid AI response format');
  }
};

// Mock for development
export const mockGenerateComponent = async (prompt) => {
  return {
    componentName: 'MockComponent',
    jsx: `function MockComponent() {\n  return <div>Mock</div>;\n}`,
    css: '.mock { color: red; }',
    tests: '// Tests would be here',
    storybook: '// Storybook would be here',
    explanation: 'Mock component generated'
  };
};