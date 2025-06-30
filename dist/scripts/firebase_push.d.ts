import { FirebaseBlueprint, AgentTask, ErrorLog, HumanFirebreakQueue } from '../src/schemas/blueprint-schemas';
type PushDataType = FirebaseBlueprint | AgentTask | ErrorLog | HumanFirebreakQueue;
type CollectionName = 'blueprints' | 'agent_tasks' | 'error_logs' | 'human_firebreak_queue';
interface PushOptions {
    collection: CollectionName;
    data: PushDataType;
    documentId?: string;
    merge?: boolean;
}
export declare class FirebasePush {
    private db;
    private config;
    constructor();
    pushData(options: PushOptions): Promise<string>;
    getDocument(collection: CollectionName, documentId: string): Promise<PushDataType>;
    queryCollection(collection: CollectionName, query?: Partial<PushDataType>): Promise<PushDataType[]>;
    deleteDocument(collection: CollectionName, documentId: string): Promise<void>;
}
export {};
//# sourceMappingURL=firebase_push.d.ts.map