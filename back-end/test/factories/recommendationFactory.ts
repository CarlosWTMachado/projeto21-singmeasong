import { faker } from '@faker-js/faker';
import { prisma } from '../../src/database';

export function generate() {
	return {
		name: faker.random.word(),
		youtubeLink: 'https://www.youtube.com/a'
	};
}

export function generateWithScore() {
	return {
		name: faker.random.word(),
		youtubeLink: 'https://www.youtube.com/a',
		score: Math.floor((Math.random() * 100) - 5),
	};
}

export function createFake(score = 0) {
	return {
		id: Math.floor(Math.random() * 100),
		name: faker.random.word(),
		youtubeLink: 'https://www.youtube.com/a',
		score: score,
	};
}

export async function create() {
	const recommendation = generate();

	const insertedRecommendation = await prisma.recommendation.create({
		data: recommendation
	});

	return { recommendation, insertedRecommendation };
}

export async function createWithScore() {
	const recommendation = generateWithScore();

	const insertedRecommendation = await prisma.recommendation.create({
		data: recommendation
	});

	return { recommendation, insertedRecommendation };
}

export async function create11() {
	for (let i = 0; i < 11; i++) await create();
}

export async function createTop() {
	for (let i = 0; i < 10; i++) await createWithScore();
}

export async function downvote5(id: number) {
	await prisma.recommendation.update({
		where: { id },
		data: {
			score: -5,
		},
	});
}