"use client";

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private static messages: Message[] = [];
  private static isProcessing: boolean = false;

  static async sendMessage(message: string): Promise<string> {
    try {
      if (this.isProcessing) {
        return "Please wait for the previous message to complete.";
      }

      this.isProcessing = true;

      // Add user message to history
      this.messages.push({ role: 'user', content: message });

      // Call our API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim()
        })
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        if (response.status === 429) {
          return errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const responseMessage = data.response;

      // Add assistant response to history
      this.messages.push({ role: 'assistant', content: responseMessage });

      return responseMessage;
    } catch (error: any) {
      console.error('Chat Error:', error);
      return "I apologize, but I encountered an error. Please try again in a moment.";
    } finally {
      this.isProcessing = false;
    }
  }

  static getMessageHistory(): Message[] {
    return this.messages;
  }

  static clearHistory(): void {
    this.messages = [];
  }
} 