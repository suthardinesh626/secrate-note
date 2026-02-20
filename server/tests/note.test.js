import { jest } from '@jest/globals';

jest.unstable_mockModule('@google/generative-ai', () => ({
    GoogleGenerativeAI: class {
        constructor() { }
        getGenerativeModel() {
            return {
                generateContent: async () => ({
                    response: {
                        text: () => 'Mocked AI summary'
                    }
                })
            };
        }
    }
}));


const { default: app } = await import('../server.js');
const { default: Note } = await import('../models/Note.js');
const { default: request } = await import('supertest');
const { MongoMemoryServer } = await import('mongodb-memory-server');
const { default: mongoose } = await import('mongoose');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri; 
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Note.deleteMany({});
});

describe('Note API Integration Tests', () => {
    describe('POST /api/notes', () => {
        it('should create a new note', async () => {
            const res = await request(app)
                .post('/api/notes')
                .send({
                    noteText: 'Test note content',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('noteId');
            expect(res.body.data).toHaveProperty('noteUrl');
            expect(res.body.data.password).toBe('password123');

            const note = await Note.findById(res.body.data.noteId);
            expect(note).toBeTruthy();
            expect(note.noteText).toBe('Test note content');
        });

        it('should return 400 if note text is missing', async () => {
            const res = await request(app)
                .post('/api/notes')
                .send({
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/notes/:id/unlock', () => {
        it('should unlock a note with correct password', async () => {
            // Create a note first
            const createRes = await request(app)
                .post('/api/notes')
                .send({
                    noteText: 'Secret message',
                    password: 'testpassword'
                });

            const noteId = createRes.body.data.noteId;

            const res = await request(app)
                .post(`/api/notes/${noteId}/unlock`)
                .send({
                    password: 'testpassword'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.noteText).toBe('Secret message');
        });

        it('should return 401 with incorrect password', async () => {
            const createRes = await request(app)
                .post('/api/notes')
                .send({
                    noteText: 'Secret message',
                    password: 'testpassword'
                });

            const noteId = createRes.body.data.noteId;

            const res = await request(app)
                .post(`/api/notes/${noteId}/unlock`)
                .send({
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/notes/:id/summarize', () => {
        it('should summarize a note with correct password', async () => {
            const createRes = await request(app)
                .post('/api/notes')
                .send({
                    noteText: 'This is a long note that needs to be summarized by AI.',
                    password: 'testpassword'
                });

            const noteId = createRes.body.data.noteId;

            const res = await request(app)
                .post(`/api/notes/${noteId}/summarize`)
                .send({
                    password: 'testpassword'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.summary).toBe('Mocked AI summary');
        });
    });
});
