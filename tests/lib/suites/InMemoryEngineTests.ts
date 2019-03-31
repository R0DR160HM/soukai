import Faker from 'faker';

import Model from '@/models/Model';

import InMemoryEngine from '@/engines/InMemoryEngine';

import DocumentNotFound from '@/errors/DocumentNotFound';

import TestSuite from '../TestSuite';

import User from '../stubs/User';

export default class extends TestSuite {

    public static title: string = 'InMemory';

    private engine: InMemoryEngine;

    public setUp(): void {
        User.load();
        this.engine = new InMemoryEngine();
    }

    public testCreate(): Promise<void> {
        const name = Faker.name.firstName();

        return this.engine.create(User, { name }).then(id => {
            expect(this.engine.database).toHaveProperty(User.collection);
            expect(this.engine.database[User.collection].documents).toHaveProperty(id);
            expect(Object.keys(this.engine.database[User.collection].documents)).toHaveLength(1);
            expect(this.engine.database[User.collection].documents[id]).toEqual({ id, name });
        });
    }

    public testReadOne(): Promise<void> {
        const name = Faker.name.firstName();

        let id;

        return this.engine.create(User, { name })
            .then(documentId => {
                id = documentId;
                return this.engine.readOne(User, id);
            })
            .then(document => {
                expect(document).toEqual({ id, name });
            });
    }

    public testReadOneNonExistent(): void {
        expect(this.engine.readOne(User, Faker.random.uuid())).rejects.toThrow(DocumentNotFound);
    }

    public testReadMany(): Promise<void> {
        let otherCollection;

        do {
            otherCollection = Faker.lorem.word();
        } while (User.collection === otherCollection);

        // tslint:disable-next-line:max-classes-per-file
        class StubModel extends Model {
            public static collection = otherCollection;
        }

        const firstName = Faker.name.firstName();
        const secondName = Faker.name.firstName();

        return Promise.all([
            this.engine.create(User, { name: firstName }),
            this.engine.create(User, { name: secondName }),
            this.engine.create(StubModel, { name: Faker.name.firstName() }),
        ])
            .then(() => this.engine.readMany(User))
            .then(documents => {
                expect(documents).toHaveLength(2);
                expect(documents[0]).toEqual({ id: documents[0].id, name: firstName });
                expect(documents[1]).toEqual({ id: documents[1].id, name: secondName });
            });
    }

    public async testReadManyFilters(): Promise<void> {
        const firstName = Faker.name.firstName();
        const secondName = Faker.name.firstName();

        await this.engine.create(User, { name: firstName });
        await this.engine.create(User, { name: secondName });

        const documents = await this.engine.readMany(User, { name: secondName });

        expect(documents).toHaveLength(1);
        expect(documents[0].name).toEqual(secondName);
    }

    public testUpdate(): Promise<void> {
        const initialName = Faker.name.firstName();
        const newName = Faker.name.firstName();

        let id;

        return this.engine.create(User, { name: initialName, surname: Faker.name.lastName() })
            .then(documentId => {
                id = documentId;
                return this.engine.update(User, id, { name: newName }, ['surname']);
            })
            .then(() => {
                expect(this.engine.database[User.collection].documents[id]).toEqual({ id, name: newName });
            });
    }

    public testUpdateNonExistent(): void {
        expect(this.engine.update(User, Faker.random.uuid(), {}, [])).rejects.toThrow(DocumentNotFound);
    }

    public testDelete(): Promise<void> {
        return this.engine.create(User, { name: Faker.name.firstName() })
            .then(id => this.engine.delete(User, id))
            .then(() => {
                expect(Object.keys(this.engine.database[User.collection].documents)).toHaveLength(0);
            });
    }

    public testDeleteNonExistent(): void {
        expect(this.engine.delete(User, Faker.random.uuid())).rejects.toThrow(DocumentNotFound);
    }

}
