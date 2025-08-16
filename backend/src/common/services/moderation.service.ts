import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ModerationService {
  private aiModerationUrl: string;

  constructor(private configService: ConfigService) {
    this.aiModerationUrl = this.configService.get('AI_MODERATION_URL');
  }

  async moderateMessage(content: string): Promise<{
    isFlagged: boolean;
    reason?: string;
    confidence?: number;
  }> {
    try {
      const response = await fetch(`${this.aiModerationUrl}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        console.warn('AI moderation service unavailable, allowing message');
        return { isFlagged: false };
      }

      const result = await response.json();
      return {
        isFlagged: result.is_dangerous || false,
        reason: result.reason,
        confidence: result.confidence,
      };
    } catch (error) {
      console.warn('AI moderation service error:', error.message);
      // In case of error, allow the message but log the issue
      return { isFlagged: false };
    }
  }
}
