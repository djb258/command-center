import { z } from 'zod';
export declare const GoogleWorkspaceConfigSchema: z.ZodObject<
  {
    clientId: z.ZodString;
    clientSecret: z.ZodString;
    redirectUri: z.ZodString;
    refreshToken: z.ZodOptional<z.ZodString>;
    scopes: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    refreshToken?: string | undefined;
  },
  {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    refreshToken?: string | undefined;
    scopes?: string[] | undefined;
  }
>;
export type GoogleWorkspaceConfig = z.infer<typeof GoogleWorkspaceConfigSchema>;
export declare const GoogleDriveFileSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodOptional<z.ZodString>;
    createdTime: z.ZodString;
    modifiedTime: z.ZodString;
    parents: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    webViewLink: z.ZodOptional<z.ZodString>;
    webContentLink: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    name: string;
    mimeType: string;
    createdTime: string;
    modifiedTime: string;
    size?: string | undefined;
    parents?: string[] | undefined;
    webViewLink?: string | undefined;
    webContentLink?: string | undefined;
  },
  {
    id: string;
    name: string;
    mimeType: string;
    createdTime: string;
    modifiedTime: string;
    size?: string | undefined;
    parents?: string[] | undefined;
    webViewLink?: string | undefined;
    webContentLink?: string | undefined;
  }
>;
export declare const GoogleDocsDocumentSchema: z.ZodObject<
  {
    documentId: z.ZodString;
    title: z.ZodString;
    body: z.ZodObject<
      {
        content: z.ZodArray<z.ZodAny, 'many'>;
      },
      'strip',
      z.ZodTypeAny,
      {
        content: any[];
      },
      {
        content: any[];
      }
    >;
    revisionId: z.ZodString;
    suggestionsViewMode: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    documentId: string;
    title: string;
    body: {
      content: any[];
    };
    revisionId: string;
    suggestionsViewMode?: string | undefined;
  },
  {
    documentId: string;
    title: string;
    body: {
      content: any[];
    };
    revisionId: string;
    suggestionsViewMode?: string | undefined;
  }
>;
export declare const GoogleSheetsSpreadsheetSchema: z.ZodObject<
  {
    spreadsheetId: z.ZodString;
    properties: z.ZodObject<
      {
        title: z.ZodString;
        locale: z.ZodOptional<z.ZodString>;
        timeZone: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        title: string;
        locale?: string | undefined;
        timeZone?: string | undefined;
      },
      {
        title: string;
        locale?: string | undefined;
        timeZone?: string | undefined;
      }
    >;
    sheets: z.ZodArray<
      z.ZodObject<
        {
          properties: z.ZodObject<
            {
              sheetId: z.ZodNumber;
              title: z.ZodString;
              index: z.ZodNumber;
            },
            'strip',
            z.ZodTypeAny,
            {
              title: string;
              sheetId: number;
              index: number;
            },
            {
              title: string;
              sheetId: number;
              index: number;
            }
          >;
        },
        'strip',
        z.ZodTypeAny,
        {
          properties: {
            title: string;
            sheetId: number;
            index: number;
          };
        },
        {
          properties: {
            title: string;
            sheetId: number;
            index: number;
          };
        }
      >,
      'many'
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    spreadsheetId: string;
    properties: {
      title: string;
      locale?: string | undefined;
      timeZone?: string | undefined;
    };
    sheets: {
      properties: {
        title: string;
        sheetId: number;
        index: number;
      };
    }[];
  },
  {
    spreadsheetId: string;
    properties: {
      title: string;
      locale?: string | undefined;
      timeZone?: string | undefined;
    };
    sheets: {
      properties: {
        title: string;
        sheetId: number;
        index: number;
      };
    }[];
  }
>;
export declare const GoogleCalendarEventSchema: z.ZodObject<
  {
    id: z.ZodString;
    summary: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    start: z.ZodObject<
      {
        dateTime: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        timeZone: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
      },
      {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
      }
    >;
    end: z.ZodObject<
      {
        dateTime: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        timeZone: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
      },
      {
        date?: string | undefined;
        timeZone?: string | undefined;
        dateTime?: string | undefined;
      }
    >;
    attendees: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            email: z.ZodString;
            displayName: z.ZodOptional<z.ZodString>;
            responseStatus: z.ZodOptional<z.ZodString>;
          },
          'strip',
          z.ZodTypeAny,
          {
            email: string;
            displayName?: string | undefined;
            responseStatus?: string | undefined;
          },
          {
            email: string;
            displayName?: string | undefined;
            responseStatus?: string | undefined;
          }
        >,
        'many'
      >
    >;
    location: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    start: {
      date?: string | undefined;
      timeZone?: string | undefined;
      dateTime?: string | undefined;
    };
    id: string;
    summary: string;
    end: {
      date?: string | undefined;
      timeZone?: string | undefined;
      dateTime?: string | undefined;
    };
    status?: string | undefined;
    description?: string | undefined;
    attendees?:
      | {
          email: string;
          displayName?: string | undefined;
          responseStatus?: string | undefined;
        }[]
      | undefined;
    location?: string | undefined;
  },
  {
    start: {
      date?: string | undefined;
      timeZone?: string | undefined;
      dateTime?: string | undefined;
    };
    id: string;
    summary: string;
    end: {
      date?: string | undefined;
      timeZone?: string | undefined;
      dateTime?: string | undefined;
    };
    status?: string | undefined;
    description?: string | undefined;
    attendees?:
      | {
          email: string;
          displayName?: string | undefined;
          responseStatus?: string | undefined;
        }[]
      | undefined;
    location?: string | undefined;
  }
>;
export declare class GoogleWorkspaceIntegration {
  private config;
  private auth;
  private drive;
  private docs;
  private sheets;
  private calendar;
  private gmail;
  constructor(config: GoogleWorkspaceConfig);
  private initializeAuth;
  private initializeServices;
  generateAuthUrl(): string;
  exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
  }>;
  listFiles(query?: string): Promise<GoogleDriveFileSchema[]>;
  uploadFile(
    filePath: string,
    fileName?: string,
    folderId?: string
  ): Promise<GoogleDriveFileSchema>;
  downloadFile(fileId: string, outputPath: string): Promise<void>;
  createFolder(
    folderName: string,
    parentFolderId?: string
  ): Promise<GoogleDriveFileSchema>;
  createDocument(title: string): Promise<GoogleDocsDocumentSchema>;
  getDocument(documentId: string): Promise<GoogleDocsDocumentSchema>;
  updateDocument(documentId: string, requests: any[]): Promise<void>;
  createSpreadsheet(title: string): Promise<GoogleSheetsSpreadsheetSchema>;
  getSpreadsheet(spreadsheetId: string): Promise<GoogleSheetsSpreadsheetSchema>;
  updateSheet(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<void>;
  getSheetValues(spreadsheetId: string, range: string): Promise<any[][]>;
  listEvents(
    calendarId?: string,
    timeMin?: string,
    timeMax?: string
  ): Promise<GoogleCalendarEventSchema[]>;
  createEvent(
    calendarId: string,
    event: Partial<GoogleCalendarEventSchema>
  ): Promise<GoogleCalendarEventSchema>;
  updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<GoogleCalendarEventSchema>
  ): Promise<GoogleCalendarEventSchema>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
  listMessages(query?: string, maxResults?: number): Promise<any[]>;
  getMessage(messageId: string): Promise<any>;
  private getMimeType;
  healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: Record<string, boolean>;
    errors: string[];
  }>;
  validateConfig(): {
    isValid: boolean;
    issues: string[];
  };
}
//# sourceMappingURL=google_workspace_integration.d.ts.map
