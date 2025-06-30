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
exports.NeonSync = void 0;
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
const blueprint_schemas_1 = require("../src/schemas/blueprint-schemas");
dotenv.config();
class NeonSync {
    constructor() {
        this.config = {
            connectionString: process.env.NEON_DATABASE_URL || '',
            host: process.env.NEON_HOST || '',
            database: process.env.NEON_DATABASE || '',
            username: process.env.NEON_USERNAME || '',
            password: process.env.NEON_PASSWORD || '',
        };
        if (!this.config.connectionString && (!this.config.host || !this.config.database || !this.config.username || !this.config.password)) {
            throw new Error('Neon database configuration missing. Please check environment variables.');
        }
        this.pool = new pg_1.Pool({
            connectionString: this.config.connectionString || undefined,
            host: this.config.host || undefined,
            database: this.config.database || undefined,
            user: this.config.username || undefined,
            password: this.config.password || undefined,
            ssl: {
                rejectUnauthorized: false,
            },
        });
    }
    async syncData(options) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const validatedData = [];
            const validationErrors = [];
            for (let i = 0; i < options.data.length; i++) {
                try {
                    const validatedRecord = (0, blueprint_schemas_1.validateBlueprintForNeon)(options.data[i]);
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
            if (validatedData.length === 0) {
                throw new Error('No valid data to sync');
            }
            for (const record of validatedData) {
                if (options.upsert && options.conflictColumns) {
                    await this.upsertRecord(client, options.table, record, options.conflictColumns);
                }
                else {
                    await this.insertRecord(client, options.table, record);
                }
            }
            await client.query('COMMIT');
            console.log(`Data synced successfully to ${options.table}`);
            console.log(`Synced ${validatedData.length} valid records, skipped ${validationErrors.length} invalid records`);
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Error syncing data to Neon:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async insertRecord(client, table, record) {
        const columns = Object.keys(record);
        const values = Object.values(record);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
        const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        await client.query(query, values);
    }
    async upsertRecord(client, table, record, conflictColumns) {
        const columns = Object.keys(record);
        const values = Object.values(record);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
        const updateColumns = columns.filter(col => !conflictColumns.includes(col));
        const updateSet = updateColumns.map((col, index) => `${col} = $${values.length + index + 1}`).join(', ');
        const query = `
      INSERT INTO ${table} (${columns.join(', ')}) 
      VALUES (${placeholders})
      ON CONFLICT (${conflictColumns.join(', ')}) 
      DO UPDATE SET ${updateSet}
    `;
        const updateValues = updateColumns.map(col => record[col]);
        await client.query(query, [...values, ...updateValues]);
    }
    async queryData(query, params) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(query, params);
            return result.rows;
        }
        catch (error) {
            console.error('Error querying Neon database:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async createTable(tableName, schema) {
        const client = await this.pool.connect();
        try {
            await client.query(schema);
            console.log(`Table ${tableName} created successfully`);
        }
        catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async close() {
        await this.pool.end();
    }
}
exports.NeonSync = NeonSync;
if (require.main === module) {
    const neon = new NeonSync();
    const sampleData = [
        {
            id: 'bp-001',
            name: 'Test Blueprint 1',
            status: 'active',
            version: '1.0.0',
            author: 'Test User',
            timestamp: new Date().toISOString(),
            created_at: new Date(),
            description: 'Test blueprint for Neon validation'
        },
        {
            id: 'bp-002',
            name: 'Test Blueprint 2',
            status: 'inactive',
            version: '2.0.0',
            author: 'Test User',
            timestamp: new Date().toISOString(),
            created_at: new Date(),
            description: 'Another test blueprint'
        },
    ];
    neon.syncData({
        table: 'blueprints',
        data: sampleData,
        upsert: true,
        conflictColumns: ['id'],
    }).catch(console.error);
}
//# sourceMappingURL=neon_sync.js.map