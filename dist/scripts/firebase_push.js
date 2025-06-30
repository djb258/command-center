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
exports.FirebasePush = void 0;
const admin = __importStar(require("firebase-admin"));
const dotenv = __importStar(require("dotenv"));
const blueprint_schemas_1 = require("../src/schemas/blueprint-schemas");
dotenv.config();
class FirebasePush {
    constructor() {
        this.config = {
            projectId: process.env.FIREBASE_PROJECT_ID || '',
            privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        };
        if (!this.config.projectId || !this.config.privateKey || !this.config.clientEmail) {
            throw new Error('Firebase configuration missing. Please check environment variables.');
        }
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: this.config.projectId,
                    privateKey: this.config.privateKey.replace(/\\n/g, '\n'),
                    clientEmail: this.config.clientEmail,
                }),
            });
        }
        this.db = admin.firestore();
    }
    async pushData(options) {
        try {
            const collectionRef = this.db.collection(options.collection);
            let validatedData;
            switch (options.collection) {
                case 'blueprints':
                    validatedData = (0, blueprint_schemas_1.validateBlueprintForFirebase)(options.data);
                    break;
                case 'agent_tasks':
                    validatedData = (0, blueprint_schemas_1.validateAgentTask)(options.data);
                    break;
                case 'error_logs':
                    validatedData = (0, blueprint_schemas_1.validateErrorLog)(options.data);
                    break;
                case 'human_firebreak_queue':
                    validatedData = (0, blueprint_schemas_1.validateHumanFirebreakQueue)(options.data);
                    break;
                default:
                    throw new Error(`No validation schema found for collection: ${options.collection}`);
            }
            let docRef;
            if (options.documentId) {
                docRef = collectionRef.doc(options.documentId);
                await docRef.set(validatedData, { merge: options.merge || false });
            }
            else {
                docRef = await collectionRef.add(validatedData);
            }
            console.log(`Data pushed successfully to ${options.collection}`);
            console.log(`Document ID: ${docRef.id}`);
            return docRef.id;
        }
        catch (error) {
            console.error('Error pushing data to Firebase:', error);
            throw error;
        }
    }
    async getDocument(collection, documentId) {
        try {
            const doc = await this.db.collection(collection).doc(documentId).get();
            if (!doc.exists) {
                throw new Error(`Document ${documentId} not found in collection ${collection}`);
            }
            return { id: doc.id, ...doc.data() };
        }
        catch (error) {
            console.error('Error getting document from Firebase:', error);
            throw error;
        }
    }
    async queryCollection(collection, query) {
        try {
            let queryRef = this.db.collection(collection);
            if (query) {
                Object.keys(query).forEach(key => {
                    const value = query[key];
                    queryRef = queryRef.where(key, '==', value);
                });
            }
            const snapshot = await queryRef.get();
            const documents = [];
            snapshot.forEach(doc => {
                documents.push({ id: doc.id, ...doc.data() });
            });
            return documents;
        }
        catch (error) {
            console.error('Error querying Firebase collection:', error);
            throw error;
        }
    }
    async deleteDocument(collection, documentId) {
        try {
            await this.db.collection(collection).doc(documentId).delete();
            console.log(`Document ${documentId} deleted successfully from ${collection}`);
        }
        catch (error) {
            console.error('Error deleting document from Firebase:', error);
            throw error;
        }
    }
}
exports.FirebasePush = FirebasePush;
if (require.main === module) {
    const firebase = new FirebasePush();
    const sampleData = {
        id: 'bp-001',
        name: 'Test Blueprint',
        version: '1.0.0',
        status: 'active',
        author: 'Test User',
        timestamp: new Date().toISOString(),
        description: 'Test blueprint for Firebase validation',
        collection: 'blueprints'
    };
    firebase.pushData({
        collection: 'blueprints',
        data: sampleData,
    }).catch(console.error);
}
//# sourceMappingURL=firebase_push.js.map