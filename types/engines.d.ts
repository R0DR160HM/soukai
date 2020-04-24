type EngineAttributePrimitiveValue = string | number | boolean | null | Date;

type EngineAttributeValue = EngineAttributePrimitiveValue | EngineAttributePrimitiveValue[];

export interface EngineAttributes {
    [field: string]: EngineAttributeValue | EngineAttributes | EngineAttributes[];
}

export interface Documents {
    [id: string]: EngineAttributes;
}

export interface Filters {
    $in?: string[];

    [field: string]:
        { $contains: any[] } |
        any;
}

export interface Engine {

    create(collection: string, attributes: EngineAttributes, id?: string): Promise<string>;

    readOne(collection: string, id: string): Promise<EngineAttributes>;

    readMany(collection: string, filters?: Filters): Promise<Documents>;

    update(
        collection: string,
        id: string,
        updatedAttributes: EngineAttributes,
        removedAttributes: string[],
    ): Promise<void>;

    delete(collection: string, id: string): Promise<void>;

}

export class EngineHelper {

    filterDocuments(documents: Documents, filters?: Filters): Documents;

    obtainDocumentId(id?: string): string;

}

export interface InMemoryEngineDatabase {
    [collection: string]: {
        [id: string]: EngineAttributes,
    };
}

export class InMemoryEngine implements Engine {

    readonly database: InMemoryEngineDatabase;

    create(collection: string, attributes: EngineAttributes, id?: string): Promise<string>;

    readOne(collection: string, id: string): Promise<EngineAttributes>;

    readMany(collection: string): Promise<Documents>;

    update(
        collection: string,
        id: string,
        updatedAttributes: EngineAttributes,
        removedAttributes: string[],
    ): Promise<void>;

    delete(collection: string, id: string): Promise<void>;

}

export class LogEngine implements Engine {

    constructor(engine: Engine);

    create(collection: string, attributes: EngineAttributes, id?: string): Promise<string>;

    readOne(collection: string, id: string): Promise<EngineAttributes>;

    readMany(collection: string): Promise<Documents>;

    update(
        collection: string,
        id: string,
        updatedAttributes: EngineAttributes,
        removedAttributes: string[],
    ): Promise<void>;

    delete(collection: string, id: string): Promise<void>;

}

export class LocalStorageEngine implements Engine {

    constructor(prefix?: string);

    clear(): void;

    create(collection: string, attributes: EngineAttributes, id?: string): Promise<string>;

    readOne(collection: string, id: string): Promise<EngineAttributes>;

    readMany(collection: string): Promise<Documents>;

    update(
        collection: string,
        id: string,
        updatedAttributes: EngineAttributes,
        removedAttributes: string[],
    ): Promise<void>;

    delete(collection: string, id: string): Promise<void>;

}

export class IndexedDBEngine implements Engine {

    constructor(database?: string);

    purgeDatabase(): Promise<void>;

    closeConnections(): void;

    create(collection: string, attributes: EngineAttributes, id?: string): Promise<string>;

    readOne(collection: string, id: string): Promise<EngineAttributes>;

    readMany(collection: string): Promise<Documents>;

    update(
        collection: string,
        id: string,
        updatedAttributes: EngineAttributes,
        removedAttributes: string[],
    ): Promise<void>;

    delete(collection: string, id: string): Promise<void>;

}
