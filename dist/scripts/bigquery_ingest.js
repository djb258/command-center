"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigQueryIngest = void 0;
const bigquery_1 = require("@google-cloud/bigquery");
const dotenv = __importStar(require("dotenv"));
const blueprint_schemas_1 = require("../src/schemas/blueprint-schemas");
dotenv.config();
class BigQueryIngest {
    constructor() {
        this.config = {
            projectId: process.env.BIGQUERY_PROJECT_ID || '',
            datasetId: process.env.BIGQUERY_DATASET_ID || '',
        };
        if (!this.config.projectId || !this.config.datasetId) {
            throw new Error('BIGQUERY_PROJECT_ID and BIGQUERY_DATASET_ID must be set in environment variables');
        }
        this.bigquery = new bigquery_1.BigQuery({
            projectId: this.config.projectId,
        });
    }
    async ingestData(options) {
        try {
            const dataset = this.bigquery.dataset(this.config.datasetId);
            const table = dataset.table(options.tableId);
            const validatedData = [];
            const validationErrors = [];
            for (let i = 0; i < options.data.length; i++) {
                try {
                    const validatedRecord = (0, blueprint_schemas_1.validateBlueprintForBigQuery)(options.data[i]);
                    validatedData.push(validatedRecord);
                }
                catch (error) {
                    validationErrors.push(`Record ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            if (validationErrors.length > 0) {
                console.warn('Validation errors found:');
                validationErrors.forEach(error => console.warn(`  - ${error}`));
            }
            if (validatedData.length > 0) {
                await table.insert(validatedData);
                console.log(`Data ingested successfully to ${this.config.projectId}.${this.config.datasetId}.${options.tableId}`);
                console.log(`Ingested ${validatedData.length} valid records, skipped ${validationErrors.length} invalid records`);
            }
            else {
                throw new Error('No valid data to ingest');
            }
        }
        catch (error) {
            console.error('Error ingesting data to BigQuery:', error);
            throw error;
        }
    }
    async createTable(tableId, schema) {
        try {
            const dataset = this.bigquery.dataset(this.config.datasetId);
            const table = dataset.table(tableId);
            await table.create({
                schema: schema,
            });
            console.log(`Table ${tableId} created successfully`);
        }
        catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
    }
    async queryData(query) {
        try {
            const [rows] = await this.bigquery.query({ query });
            return rows;
        }
        catch (error) {
            console.error('Error querying BigQuery:', error);
            throw error;
        }
    }
}
exports.BigQueryIngest = BigQueryIngest;
if (require.main === module) {
    const ingest = new BigQueryIngest();
    const sampleData = [
        {
            id: 'bp-001',
            name: 'Test Blueprint 1',
            version: '1.0.0',
            status: 'active',
            author: 'Test User',
            timestamp: new Date().toISOString(),
            description: 'Test blueprint for validation'
        },
        {
            id: 'bp-002',
            name: 'Test Blueprint 2',
            version: '2.0.0',
            status: 'inactive',
            author: 'Test User',
            timestamp: new Date().toISOString(),
            description: 'Another test blueprint'
        },
    ];
    ingest.ingestData({
        tableId: 'blueprints',
        data: sampleData,
    }).catch(console.error);
}
//# sourceMappingURL=bigquery_ingest.js.map