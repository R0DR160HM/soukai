import Engine, { Attributes, Documents, Filters } from '@/engines/Engine';
import EngineHelper from '@/engines/EngineHelper';

import DocumentNotFound from '@/errors/DocumentNotFound';

export default class LocalStorageEngine implements Engine {

    private prefix: string;

    private helper: EngineHelper;

    public constructor(prefix: string = '') {
        this.prefix = prefix;
        this.helper = new EngineHelper();
    }

    public async create(collection: string, attributes: Attributes, id?: string): Promise<string> {
        const documents = this.readItem(collection, {});

        id = this.helper.getDocumentId(id);

        documents[id] = this.serializeAttributes(attributes);

        this.writeItem(collection, documents);

        return id;
    }

    public async readOne(collection: string, id: string): Promise<Attributes> {
        const documents = this.readItem(collection, {});

        if (!(id in documents)) {
            throw new DocumentNotFound(id);
        }

        return this.deserializeAttributes(documents[id]);
    }

    public async readMany(collection: string, filters?: Filters): Promise<Documents> {
        const documents = this.readItem(collection, {});

        for (const id in documents) {
            documents[id] = this.deserializeAttributes(documents[id]);
        }

        return this.helper.filterDocuments(documents, filters);
    }

    public async update(
        collection: string,
        id: string,
        dirtyAttributes: Attributes,
        removedAttributes: string[],
    ): Promise<void> {
        const documents = this.readItem(collection, {});

        if (!(id in documents)) {
            throw new DocumentNotFound(id);
        }

        const attributes = this.deserializeAttributes(documents[id]);

        for (const attribute in dirtyAttributes) {
            attributes[attribute] = dirtyAttributes[attribute];
        }

        for (const attribute of removedAttributes) {
            delete attributes[attribute];
        }

        documents[id] = this.serializeAttributes(attributes);

        this.writeItem(collection, documents);
    }

    public async delete(collection: string, id: string): Promise<void> {
        const documents = this.readItem(collection, {});

        if (!(id in documents)) {
            throw new DocumentNotFound(id);
        }

        delete documents[id];

        this.writeItem(collection, documents);
    }

    private readItem(key: string, defaultValue: any = null): any {
        const rawValue = localStorage.getItem(this.prefix + key);

        return rawValue !== null ? JSON.parse(rawValue) : defaultValue;
    }

    private writeItem(key: string, value: any): void {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    private serializeAttributes(attributes: Attributes): Attributes {
        for (const attribute in attributes) {
            const value = attributes[attribute];

            attributes[attribute] = this.serializeAttributeValue(value);
        }

        return attributes;
    }

    private serializeAttributeValue(value: any): any {
        if (Array.isArray(value)) {
            return value.map(arrayValue => this.serializeAttributeValue(arrayValue));
        } else if (value instanceof Date) {
            return { __dateTime: value.getTime() };
        } else if (typeof value === 'object') {
            return this.serializeAttributes(value as Attributes);
        } else {
            return value;
        }
    }

    private deserializeAttributes(attributes: Attributes): Attributes {
        for (const attribute in attributes) {
            const value = attributes[attribute];

            attributes[attribute] = this.deserializeAttributeValue(value);
        }

        return attributes;
    }

    private deserializeAttributeValue(value: any): any {
        if (Array.isArray(value)) {
            return value.map(arrayValue => this.deserializeAttributes(arrayValue));
        } else if (typeof value === 'object') {
            return '__dateTime' in value
                ? new Date(value.__dateTime)
                : this.deserializeAttributeValue(value as Attributes);
        } else {
            return value;
        }
    }

}
