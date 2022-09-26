import app from '../../src/app';
import supertest from 'supertest';
import { prisma } from '../../src/database';
import * as recommendationFactory from '../factories/recommendationFactory';

beforeEach(async () => {
	await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

afterAll(async () => {
	await prisma.$disconnect();
});

describe('Test POST /recommendations', () => {
	it('Return 201, register recommendations correctly', async () => {
		const recommendation = recommendationFactory.generate();

		const result = await supertest(app).post('/recommendations').send(recommendation);

		expect(result.status).toEqual(201);
	});

	it('Return 409, try register recommendation alredy registred', async () => {
		const { recommendation } = await recommendationFactory.create();

		const result = await supertest(app).post('/recommendations').send(recommendation);

		expect(result.status).toEqual(409);
	});

	it('Return 422, try register recommendation with wrong schema', async () => {
		const recommendation = recommendationFactory.generate();

		const result = await supertest(app).post('/recommendations').send({...recommendation, test: 'error'});

		expect(result.status).toEqual(422);
	});
});

describe('/recommendations/:id/upvote', () => {
	it('Return 200, register recommendation upvote correctly', async () => {
		const { insertedRecommendation } = await recommendationFactory.create();

		const result = await supertest(app).post(`/recommendations/${insertedRecommendation.id}/upvote`);

		expect(result.status).toEqual(200);
	});

	it('Return 404, try register upvote on inexistent recommendation', async () => {
		const result = await supertest(app).post('/recommendations/0/upvote');

		expect(result.status).toEqual(404);
	});
});

describe('/recommendations/:id/downvote', () => {
	it('Return 200, register recommendation downvote correctly', async () => {
		const { insertedRecommendation } = await recommendationFactory.create();

		const result = await supertest(app).post(`/recommendations/${insertedRecommendation.id}/downvote`);

		expect(result.status).toEqual(200);
	});

	it('Return 404, try register downvote on inexistent recommendation', async () => {
		const result = await supertest(app).post('/recommendations/0/downvote');

		expect(result.status).toEqual(404);
	});

	it('Return 404, score below -5 recommendation get deleted', async () => {
		const { insertedRecommendation } = await recommendationFactory.create();
		await recommendationFactory.downvote5(insertedRecommendation.id);

		const resultDelete = await supertest(app).post(`/recommendations/${insertedRecommendation.id}/downvote`);
		const resultAlredyDeleted = await supertest(app).post(`/recommendations/${insertedRecommendation.id}/downvote`);

		expect(resultDelete.status).toEqual(200);
		expect(resultAlredyDeleted.status).toEqual(404);
	});
});

describe('Test GET /recommendations', () => {
	it('Return 200, get recommendations correctly', async () => {
		const result = await supertest(app).get('/recommendations');

		expect(result.status).toEqual(200);
		expect(result.body.length).toEqual(0);
	});

	it('get last 10 recommendations', async () => {
		await recommendationFactory.create11();

		const result = await supertest(app).get('/recommendations');

		expect(result.body.length).toEqual(10);
	});
});

describe('Test GET /recommendations/:id', () => {
	it('Return 200, get recommendation by id correctly', async () => {
		const { insertedRecommendation } = await recommendationFactory.create();

		const result = await supertest(app).get(`/recommendations/${insertedRecommendation.id}`);

		expect(result.status).toEqual(200);
		expect(result.body).toEqual(insertedRecommendation);
	});

	it('Return 404, try get recommendation by inexistent id', async () => {
		const result = await supertest(app).get('/recommendations/0');

		expect(result.status).toEqual(404);
	});
});

describe('Test GET /recommendations/random', () => {
	it('Return 200, try get a random recommendation', async () => {
		await recommendationFactory.create11();

		const result = await supertest(app).get('/recommendations/random');

		expect(result.status).toEqual(200);
		expect(result.body).toEqual(
			expect.objectContaining({
				id: expect.any(Number),
				name: expect.any(String),
				youtubeLink: expect.any(String),
				score: expect.any(Number),
			}),
		);
	});

	it('Return 404, try get random recommendation but have no recommendations registred', async () => {
		const result = await supertest(app).get('/recommendations/random');

		expect(result.status).toEqual(404);
	});
});

describe('Test GET /recommendations/top/:amount', () => {
	it('Return 200, try get top 5 recommendations', async () => {
		await recommendationFactory.createTop();

		const result = await supertest(app).get('/recommendations/top/5');

		expect(result.status).toEqual(200);
		expect(result.body).toBeInstanceOf(Array);
		expect(result.body.length).toBe(5);
		expect(result.body[0].score).toBeGreaterThanOrEqual(result.body[1].score);
		expect(result.body[1].score).toBeGreaterThanOrEqual(result.body[2].score);
		expect(result.body[2].score).toBeGreaterThanOrEqual(result.body[3].score);
		expect(result.body[3].score).toBeGreaterThanOrEqual(result.body[4].score);
	});

	it('Return empty array, try get top recommendation but have no recommendations registred', async () => {
		const result = await supertest(app).get('/recommendations/top/5');

		expect(result.body.length).toEqual(0);
	});
});