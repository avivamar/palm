import type { NextRequest } from 'next/server';
import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';
import { ContactValidation } from '@/validations/ContactValidation';

// 超时配置
const TIMEOUT_CONFIG = {
  notionApi: 8000, // 8秒 - Notion API调用
  validation: 2000, // 2秒 - 数据验证
};

// 超时包装器
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

// 指数退避重试函数
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const delay = baseDelay * (2 ** (attempt - 1));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Contact form database ID - you'll need to create this database in Notion
const CONTACT_DATABASE_ID = process.env.NOTION_CONTACT_DATABASE_ID || '';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body with timeout
    const body = await withTimeout(request.json(), TIMEOUT_CONFIG.validation);
    const validatedData = await withTimeout(
      Promise.resolve(ContactValidation.parse(body)),
      TIMEOUT_CONFIG.validation,
    );

    // Check if Notion is configured
    if (!process.env.NOTION_TOKEN) {
      return NextResponse.json(
        { message: 'Notion integration is not configured' },
        { status: 500 },
      );
    }

    if (!CONTACT_DATABASE_ID) {
      return NextResponse.json(
        { message: 'Contact database ID is not configured' },
        { status: 500 },
      );
    }

    // Create a new page in the Notion database with retry mechanism
    const response = await retryWithBackoff(async () => {
      return await withTimeout(
        notion.pages.create({
          parent: {
            database_id: CONTACT_DATABASE_ID,
          },
          properties: {
            'Name': {
              title: [
                {
                  text: {
                    content: `${validatedData.firstName} ${validatedData.lastName}`,
                  },
                },
              ],
            },
            'Email': {
              email: validatedData.email,
            },
            'Subject': {
              rich_text: [
                {
                  text: {
                    content: validatedData.subject,
                  },
                },
              ],
            },
            'Message': {
              rich_text: [
                {
                  text: {
                    content: validatedData.message,
                  },
                },
              ],
            },
            'Status': {
              select: {
                name: 'New',
              },
            },
            'Created At': {
              date: {
                start: new Date().toISOString(),
              },
            },
          },
        }),
        TIMEOUT_CONFIG.notionApi,
      );
    });

    return NextResponse.json(
      {
        message: 'Contact form submitted successfully',
        id: response.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Contact form submission error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      notionToken: process.env.NOTION_TOKEN ? 'Present' : 'Missing',
      databaseId: CONTACT_DATABASE_ID ? 'Present' : 'Missing',
    });

    // 处理超时错误
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        { message: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    // Handle Notion API specific errors
    if (error instanceof Error) {
      if (error.message.includes('database_id')) {
        return NextResponse.json(
          { message: 'Database configuration error. Please contact support.' },
          { status: 500 },
        );
      }

      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { message: 'Authentication error. Please contact support.' },
          { status: 500 },
        );
      }

      // 处理验证错误
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { message: 'Invalid form data. Please check your input.' },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { message: `Submission failed: ${error.message}` },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: 'Failed to submit contact form. Please try again later.' },
      { status: 500 },
    );
  }
}
