import type Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "./client";
import { getMemberSystemPrompt, getAdminSystemPrompt } from "./prompts";
import { MEMBER_TOOLS, ADMIN_TOOLS, executeTool } from "./tools";
import { handleError, ErrorCodes } from "@/lib/utils/errors";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 512;
const MAX_TOOL_ROUNDS = 5;

interface ChatOptions {
  orgId: string;
  orgName: string;
  callerPhone: string;
  isAdmin: boolean;
  history: Anthropic.Messages.MessageParam[];
}

export async function chat(
  userMessage: string,
  options: ChatOptions
): Promise<string> {
  const { orgId, orgName, callerPhone, isAdmin, history } = options;

  const systemPrompt = isAdmin
    ? getAdminSystemPrompt(orgName)
    : getMemberSystemPrompt(orgName);

  const tools = isAdmin ? ADMIN_TOOLS : MEMBER_TOOLS;
  const toolCtx = { orgId, callerPhone };

  const messages: Anthropic.Messages.MessageParam[] = [
    ...history,
    { role: "user", content: userMessage },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    let response: Anthropic.Messages.Message;
    try {
      response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        tools,
        messages,
      });
    } catch (error) {
      handleError(error, { code: ErrorCodes.CLAUDE_API_ERROR });
      return "Sorry, I'm having trouble right now. Please try again in a moment.";
    }

    // If Claude finished without tool use, extract text
    if (response.stop_reason !== "tool_use") {
      const textBlock = response.content.find(
        (b): b is Anthropic.Messages.TextBlock => b.type === "text"
      );
      return (
        textBlock?.text ??
        "Sorry, I couldn't generate a response. Please try again."
      );
    }

    // Claude wants to use tools — execute them
    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const result = await executeTool(
          block.name,
          block.input as Record<string, unknown>,
          toolCtx
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  return "Sorry, that query was too complex. Could you ask something simpler?";
}
