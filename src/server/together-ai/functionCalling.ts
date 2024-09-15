// src/server/together-ai/functionCalling.ts
import { Together } from 'together-ai';
import { env } from '~/env';

// Initialize Together AI client
const together = new Together({
  apiKey: env.TOGETHER_API_KEY,
});

// Define structure for function definitions
interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

// Define available tools/functions
const tools: FunctionDefinition[] = [
  {
    name: 'analyze_personality_traits',
    description: 'Analyze the personality traits based on user input',
    parameters: {
      type: 'object',
      properties: {
        userInput: {
          type: 'string',
          description: 'The user-provided text for analysis',
        },
      },
      required: ['userInput'],
    },
  },
  {
    name: 'assess_emotional_state',
    description: 'Assess the emotional state from the user input',
    parameters: {
      type: 'object',
      properties: {
        userInput: {
          type: 'string',
          description: 'The user-provided text describing feelings',
        },
      },
      required: ['userInput'],
    },
  },
];

// Construct prompt for the AI model
const toolPrompt = `
You have access to the following functions:

${tools
  .map(
    (tool) =>
      `Use the function '${tool.name}' to '${tool.description}':\n${JSON.stringify(
        tool
      )}`
  )
  .join('\n\n')}

If you choose to call a function ONLY reply in the following format with no prefix or suffix:

<function=example_function_name>{"example_name": "example_value"}</function>

Reminder:
- Function calls MUST follow the specified format, start with <function= and end with </function>
- Required parameters MUST be specified
- Only call one function at a time
- Put the entire function call reply on one line
- If there is no function call available, answer the question like normal with your current knowledge and do not tell the user about function calls
`;

// Parse the AI's response to extract function call details
function parseToolResponse(
  response: string
): { functionName: string; arguments: Record<string, unknown> } | null {
  const functionRegex = /<function=(\w+)>(.*?)<\/function>/;
  const match = functionRegex.exec(response);

  if (match) {
    const [, functionName = '', argsString] = match;
    try {
      const args = JSON.parse(argsString ?? '{}') as Record<string, unknown>;
      return {
        functionName,
        arguments: args,
      };
    } catch (error) {
      console.error('Error parsing function arguments:', error);
      return null;
    }
  }
  return null;
}

// Function to analyze personality traits
async function analyzePersonalityTraits(userInput: string): Promise<string> {
  // Simple implementation using keywords
  const traits: string[] = [];

  if (/creative|imaginative|innovative/i.test(userInput)) {
    traits.push('creative');
  }
  if (/organized|methodical|structured/i.test(userInput)) {
    traits.push('organized');
  }
  if (/empathetic|caring|compassionate/i.test(userInput)) {
    traits.push('empathetic');
  }
  if (/adventurous|bold|daring/i.test(userInput)) {
    traits.push('adventurous');
  }

  if (traits.length === 0) {
    return 'Based on your input, your personality traits are varied and unique.';
  } else {
    return `Based on your input, your personality traits suggest that you are ${traits.join(', ')}.`;
  }
}

// Function to assess emotional state
async function assessEmotionalState(userInput: string): Promise<string> {
  // Simple implementation using sentiment analysis
  const positiveWords = ['happy', 'joy', 'excited', 'content', 'optimistic'];
  const negativeWords = ['sad', 'anxious', 'depressed', 'angry', 'frustrated'];

  let score = 0;

  positiveWords.forEach((word) => {
    if (new RegExp(`\\b${word}\\b`, 'i').test(userInput)) {
      score += 1;
    }
  });

  negativeWords.forEach((word) => {
    if (new RegExp(`\\b${word}\\b`, 'i').test(userInput)) {
      score -= 1;
    }
  });

  if (score > 0) {
    return 'From your description, it seems you are feeling positive and upbeat.';
  } else if (score < 0) {
    return 'From your description, it seems you are experiencing some negative emotions.';
  } else {
    return 'From your description, your emotional state appears to be neutral.';
  }
}

// Main function to process user query and generate response
export async function processUserQuery(userQuery: string): Promise<string> {
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    {
      role: 'system',
      content: toolPrompt,
    },
    {
      role: 'user',
      content: userQuery,
    },
  ];

  // Initial AI response
  const response = await together.chat.completions.create({
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    messages: messages,
    max_tokens: 1024,
    temperature: 0,
    // Removed 'tools' and 'tool_choice' parameters
  });

  const functionCallContent = response.choices[0]?.message?.content;

  if (typeof functionCallContent !== 'string') {
    return "I'm sorry, I couldn't generate a response.";
  }

  const parsedResponse = parseToolResponse(functionCallContent);

  if (parsedResponse) {
    const { functionName, arguments: args } = parsedResponse;

    let functionResult = '';
    if (
      functionName === 'analyze_personality_traits' &&
      typeof args.userInput === 'string'
    ) {
      functionResult = await analyzePersonalityTraits(args.userInput);
    } else if (
      functionName === 'assess_emotional_state' &&
      typeof args.userInput === 'string'
    ) {
      functionResult = await assessEmotionalState(args.userInput);
    } else {
      return "I'm sorry, I couldn't process your request.";
    }

    // Add function call and result to messages
    messages.push(
      {
        role: 'assistant',
        content: functionCallContent,
      },
      {
        role: 'assistant',
        content: functionResult,
      }
    );

    // Generate final response
    const finalResponse = await together.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0,
      // Removed 'tools' and 'tool_choice' parameters
    });

    const finalContent = finalResponse.choices[0]?.message?.content;
    return typeof finalContent === 'string'
      ? finalContent
      : "I'm sorry, I couldn't generate a response.";
  }

  return functionCallContent || "I'm sorry, I couldn't understand your request.";
}
