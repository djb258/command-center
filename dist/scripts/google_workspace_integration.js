'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.GoogleWorkspaceIntegration =
  exports.GoogleCalendarEventSchema =
  exports.GoogleSheetsSpreadsheetSchema =
  exports.GoogleDocsDocumentSchema =
  exports.GoogleDriveFileSchema =
  exports.GoogleWorkspaceConfigSchema =
    void 0;
const googleapis_1 = require('googleapis');
const zod_1 = require('zod');
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const mandatory_barton_doctrine_1 = require('../src/core/mandatory-barton-doctrine');
exports.GoogleWorkspaceConfigSchema = zod_1.z.object({
  clientId: zod_1.z.string(),
  clientSecret: zod_1.z.string(),
  redirectUri: zod_1.z.string().url(),
  refreshToken: zod_1.z.string().optional(),
  scopes: zod_1.z
    .array(zod_1.z.string())
    .default([
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.readonly',
    ]),
});
exports.GoogleDriveFileSchema = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string(),
  mimeType: zod_1.z.string(),
  size: zod_1.z.string().optional(),
  createdTime: zod_1.z.string(),
  modifiedTime: zod_1.z.string(),
  parents: zod_1.z.array(zod_1.z.string()).optional(),
  webViewLink: zod_1.z.string().optional(),
  webContentLink: zod_1.z.string().optional(),
});
exports.GoogleDocsDocumentSchema = zod_1.z.object({
  documentId: zod_1.z.string(),
  title: zod_1.z.string(),
  body: zod_1.z.object({
    content: zod_1.z.array(zod_1.z.any()),
  }),
  revisionId: zod_1.z.string(),
  suggestionsViewMode: zod_1.z.string().optional(),
});
exports.GoogleSheetsSpreadsheetSchema = zod_1.z.object({
  spreadsheetId: zod_1.z.string(),
  properties: zod_1.z.object({
    title: zod_1.z.string(),
    locale: zod_1.z.string().optional(),
    timeZone: zod_1.z.string().optional(),
  }),
  sheets: zod_1.z.array(
    zod_1.z.object({
      properties: zod_1.z.object({
        sheetId: zod_1.z.number(),
        title: zod_1.z.string(),
        index: zod_1.z.number(),
      }),
    })
  ),
});
exports.GoogleCalendarEventSchema = zod_1.z.object({
  id: zod_1.z.string(),
  summary: zod_1.z.string(),
  description: zod_1.z.string().optional(),
  start: zod_1.z.object({
    dateTime: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    timeZone: zod_1.z.string().optional(),
  }),
  end: zod_1.z.object({
    dateTime: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    timeZone: zod_1.z.string().optional(),
  }),
  attendees: zod_1.z
    .array(
      zod_1.z.object({
        email: zod_1.z.string(),
        displayName: zod_1.z.string().optional(),
        responseStatus: zod_1.z.string().optional(),
      })
    )
    .optional(),
  location: zod_1.z.string().optional(),
  status: zod_1.z.string().optional(),
});
const doctrine = (0, mandatory_barton_doctrine_1.START_WITH_BARTON_DOCTRINE)(
  'google_workspace'
);
class GoogleWorkspaceIntegration {
  constructor(config) {
    this.config = exports.GoogleWorkspaceConfigSchema.parse(config);
    this.initializeAuth();
  }
  initializeAuth() {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );
    if (this.config.refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: this.config.refreshToken,
      });
    }
    this.auth = oauth2Client;
    this.initializeServices();
  }
  initializeServices() {
    this.drive = googleapis_1.google.drive({ version: 'v3', auth: this.auth });
    this.docs = googleapis_1.google.docs({ version: 'v1', auth: this.auth });
    this.sheets = googleapis_1.google.sheets({
      version: 'v4',
      auth: this.auth,
    });
    this.calendar = googleapis_1.google.calendar({
      version: 'v3',
      auth: this.auth,
    });
    this.gmail = googleapis_1.google.gmail({ version: 'v1', auth: this.auth });
  }
  generateAuthUrl() {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      prompt: 'consent',
    });
  }
  async exchangeCodeForTokens(code) {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }
  async listFiles(query) {
    try {
      const response = await this.drive.files.list({
        pageSize: 100,
        fields:
          'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink)',
        q: query,
      });
      return (
        response.data.files?.map((file) =>
          exports.GoogleDriveFileSchema.parse(file)
        ) || []
      );
    } catch (error) {
      throw new Error(
        `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async uploadFile(filePath, fileName, folderId) {
    try {
      const fileMetadata = {
        name: fileName || path_1.default.basename(filePath),
        parents: folderId ? [folderId] : undefined,
      };
      const media = {
        mimeType: this.getMimeType(filePath),
        body: fs_1.default.createReadStream(filePath),
      };
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields:
          'id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink',
      });
      return exports.GoogleDriveFileSchema.parse(response.data);
    } catch (error) {
      throw new Error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async downloadFile(fileId, outputPath) {
    try {
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' }
      );
      const writer = fs_1.default.createWriteStream(outputPath);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      throw new Error(
        `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async createFolder(folderName, parentFolderId) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      };
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, mimeType, createdTime, modifiedTime, parents',
      });
      return exports.GoogleDriveFileSchema.parse(response.data);
    } catch (error) {
      throw new Error(
        `Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async createDocument(title) {
    try {
      const response = await this.docs.documents.create({
        requestBody: {
          title: title,
        },
      });
      return exports.GoogleDocsDocumentSchema.parse(response.data);
    } catch (error) {
      throw new Error(
        `Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getDocument(documentId) {
    try {
      const response = await this.docs.documents.get({
        documentId: documentId,
      });
      return exports.GoogleDocsDocumentSchema.parse(response.data);
    } catch (error) {
      throw new Error(
        `Failed to get document: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async updateDocument(documentId, requests) {
    try {
      await this.docs.documents.batchUpdate({
        documentId: documentId,
        requestBody: {
          requests: requests,
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async createSpreadsheet(title) {
    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: title,
          },
        },
      });
      return exports.GoogleSheetsSpreadsheetSchema.parse(response.data);
    } catch (error) {
      throw new Error(
        `Failed to create spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getSpreadsheet(spreadsheetId) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
      });
      return exports.GoogleSheetsSpreadsheetSchema.parse(response.data);
    } catch (error) {
      throw new Error(
        `Failed to get spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async updateSheet(spreadsheetId, range, values) {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        requestBody: {
          values: values,
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to update sheet: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getSheetValues(spreadsheetId, range) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
      });
      return response.data.values || [];
    } catch (error) {
      throw new Error(
        `Failed to get sheet values: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async listEvents(calendarId = 'primary', timeMin, timeMax) {
    try {
      const response = await this.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return (
        response.data.items?.map((event) =>
          exports.GoogleCalendarEventSchema.parse(event)
        ) || []
      );
    } catch (error) {
      throw new Error(
        `Failed to list events: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async createEvent(calendarId, event) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });
      return exports.GoogleCalendarEventSchema.parse(response.data);
    } catch (error) {
      throw new Error(
        `Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async updateEvent(calendarId, eventId, event) {
    try {
      const response = await this.calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        requestBody: event,
      });
      return exports.GoogleCalendarEventSchema.parse(response.data);
    } catch (error) {
      throw new Error(
        `Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async deleteEvent(calendarId, eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
      });
    } catch (error) {
      throw new Error(
        `Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async listMessages(query, maxResults = 100) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults,
      });
      return response.data.messages || [];
    } catch (error) {
      throw new Error(
        `Failed to list messages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getMessage(messageId) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  getMimeType(filePath) {
    const ext = path_1.default.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.zip': 'application/zip',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx':
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
  async healthCheck() {
    const services = {};
    const errors = [];
    try {
      await this.drive.files.list({ pageSize: 1 });
      services.drive = true;
    } catch (error) {
      services.drive = false;
      errors.push(
        `Drive: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    try {
      await this.calendar.calendarList.list({ maxResults: 1 });
      services.calendar = true;
    } catch (error) {
      services.calendar = false;
      errors.push(
        `Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    try {
      await this.gmail.users.getProfile({ userId: 'me' });
      services.gmail = true;
    } catch (error) {
      services.gmail = false;
      errors.push(
        `Gmail: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    return {
      status: errors.length === 0 ? 'healthy' : 'unhealthy',
      services,
      errors,
    };
  }
  validateConfig() {
    const issues = [];
    if (!this.config.clientId) {
      issues.push('Client ID is required');
    }
    if (!this.config.clientSecret) {
      issues.push('Client Secret is required');
    }
    if (!this.config.redirectUri) {
      issues.push('Redirect URI is required');
    }
    if (!this.config.refreshToken) {
      issues.push('Refresh token is required for API access');
    }
    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}
exports.GoogleWorkspaceIntegration = GoogleWorkspaceIntegration;
if (require.main === module) {
  const command = process.argv[2];
  const configPath = process.argv[3] || 'google-workspace-config.json';
  if (!fs_1.default.existsSync(configPath)) {
    console.log('Creating Google Workspace configuration template...');
    const template = {
      clientId: 'your-google-client-id',
      clientSecret: 'your-google-client-secret',
      redirectUri: 'http://localhost:3000/auth/callback',
      refreshToken: 'your-refresh-token',
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    };
    fs_1.default.writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(`Configuration template created at ${configPath}`);
    console.log(
      'Please edit the configuration file and run the command again.'
    );
    process.exit(0);
  }
  try {
    const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
    const googleWorkspace = new GoogleWorkspaceIntegration(config);
    switch (command) {
      case 'auth':
        console.log('Authorization URL:', googleWorkspace.generateAuthUrl());
        console.log('Please visit this URL and authorize the application.');
        break;
      case 'health':
        googleWorkspace
          .healthCheck()
          .then((result) => {
            console.log('Health Check Result:', result);
            process.exit(result.status === 'healthy' ? 0 : 1);
          })
          .catch((error) => {
            console.error('Health check failed:', error);
            process.exit(1);
          });
        break;
      case 'validate':
        const validation = googleWorkspace.validateConfig();
        console.log('Configuration Validation:', validation);
        process.exit(validation.isValid ? 0 : 1);
        break;
      case 'drive':
        const driveCommand = process.argv[3];
        switch (driveCommand) {
          case 'list':
            googleWorkspace
              .listFiles()
              .then((files) => {
                console.log('Files:', files);
              })
              .catch((error) => {
                console.error('Failed to list files:', error);
                process.exit(1);
              });
            break;
          default:
            console.log(
              'Available drive commands: list, upload, download, create-folder'
            );
        }
        break;
      case 'docs':
        const docsCommand = process.argv[3];
        switch (docsCommand) {
          case 'create':
            const title = process.argv[4] || 'New Document';
            googleWorkspace
              .createDocument(title)
              .then((doc) => {
                console.log('Created document:', doc);
              })
              .catch((error) => {
                console.error('Failed to create document:', error);
                process.exit(1);
              });
            break;
          default:
            console.log('Available docs commands: create, get, update');
        }
        break;
      case 'sheets':
        const sheetsCommand = process.argv[3];
        switch (sheetsCommand) {
          case 'create':
            const title = process.argv[4] || 'New Spreadsheet';
            googleWorkspace
              .createSpreadsheet(title)
              .then((sheet) => {
                console.log('Created spreadsheet:', sheet);
              })
              .catch((error) => {
                console.error('Failed to create spreadsheet:', error);
                process.exit(1);
              });
            break;
          default:
            console.log(
              'Available sheets commands: create, get, update, get-values'
            );
        }
        break;
      case 'calendar':
        const calendarCommand = process.argv[3];
        switch (calendarCommand) {
          case 'list':
            googleWorkspace
              .listEvents()
              .then((events) => {
                console.log('Events:', events);
              })
              .catch((error) => {
                console.error('Failed to list events:', error);
                process.exit(1);
              });
            break;
          default:
            console.log(
              'Available calendar commands: list, create, update, delete'
            );
        }
        break;
      default:
        console.log('Usage:');
        console.log('  node google_workspace_integration.js auth');
        console.log('  node google_workspace_integration.js health');
        console.log('  node google_workspace_integration.js validate');
        console.log('  node google_workspace_integration.js drive list');
        console.log(
          '  node google_workspace_integration.js docs create [title]'
        );
        console.log(
          '  node google_workspace_integration.js sheets create [title]'
        );
        console.log('  node google_workspace_integration.js calendar list');
        process.exit(1);
    }
  } catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
  }
}
//# sourceMappingURL=google_workspace_integration.js.map
