import { recommendationRepository } from '../../src/repositories/recommendationRepository.js';
import { recommendationService } from '../../src/services/recommendationsService.js';
import { jest } from '@jest/globals';
import * as recommendationFactory from '../factories/recommendationFactory';

beforeEach(() => {
	jest.resetAllMocks();
	jest.clearAllMocks();
});

describe('insert recommendations', () => {
	it('should create a recommendation', async () => {
		const recommendation = recommendationFactory.generate();
		jest.spyOn(recommendationRepository, 'findByName').mockResolvedValueOnce(null);
		jest.spyOn(recommendationRepository, 'create').mockResolvedValueOnce();

		await recommendationService.insert(recommendation);

		expect(recommendationRepository.findByName).toBeCalled();
		expect(recommendationRepository.create).toBeCalled();
	});

	it('should throw a conflict error, given a not unique recommendation name', async () => {
		const recommendation = recommendationFactory.generate();
		jest.spyOn(recommendationRepository, 'findByName').mockResolvedValueOnce({ 
			id: 1, 
			...recommendation, 
			score: 0
		});

		const promise = recommendationService.insert(recommendation);

		expect(promise).rejects.toEqual({
			type: 'conflict',
			message: 'Recommendations names must be unique'
		});
	});
});

describe('upvote recommendations', () => {
	it('should add 1 point to recommendation score', async () => {
		const recommendation = recommendationFactory.createFake();
		jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation);
		jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce({ ...recommendation, score: 1 });

		await recommendationService.upvote(recommendation.id);

		expect(recommendationRepository.updateScore).toBeCalled();
	});

	it('should fail to add 1 point to recommendation score, given an inexisting id', async () => {
		jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(null);

		const promise = recommendationService.upvote(1);

		expect(promise).rejects.toEqual({
			type: 'not_found',
			message: ''
		});
	});
});

describe('downvote recommendations', () => {
	it('should subtract 1 point to recommendation score', async () => {
		const recommendation = recommendationFactory.createFake();
		jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation);
		jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce({ ...recommendation, score: -1 });

		await recommendationService.downvote(recommendation.id);

		expect(recommendationRepository.updateScore).toBeCalled();
	});

	it('should subtract 1 point and delete recommendation if score < -5', async () => {
		const recommendation = recommendationFactory.createFake(-5);
		jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendation);
		jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce({ ...recommendation, score: -6 });
		jest.spyOn(recommendationRepository, 'remove').mockResolvedValueOnce();

		await recommendationService.downvote(recommendation.id);

		expect(recommendationRepository.remove).toBeCalled();
	});

	it('should fail to subtract point of the recommendation score, given an inexisting id', async () => {
		jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(null);

		const promise = recommendationService.downvote(1);

		expect(promise).rejects.toEqual({
			type: 'not_found',
			message: ''
		});
	});
});

describe('get recommendations', () => {
	it('get all recommendations', async () => {
		const recommendations = [
			recommendationFactory.createFake(),
			recommendationFactory.createFake(),
			recommendationFactory.createFake(),
		];
		jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations);

		await recommendationService.get();

		expect(recommendationRepository.findAll).toBeCalled();
	});

	it('get the top recommendations', async () => {
		jest.spyOn(recommendationRepository, 'getAmountByScore').mockResolvedValueOnce([]);

		await recommendationService.getTop(5);

		expect(recommendationRepository.getAmountByScore).toBeCalled();
	});

	it('should get a random recommendation with score less than or equal 10', async () => {
		const recommendation = recommendationFactory.createFake(5);
		jest.spyOn(recommendationService, 'getScoreFilter').mockReturnValueOnce('lte');
		jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce([recommendation]);

		await recommendationService.getRandom();

		expect(recommendationRepository.findAll).toBeCalled();

	});

	it('should get a random recommendation with score greater than 10', async () => {
		const recommendation = recommendationFactory.createFake(20);
		jest.spyOn(recommendationService, 'getScoreFilter').mockReturnValueOnce('gt');
		jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce([recommendation]);

		await recommendationService.getRandom();

		expect(recommendationRepository.findAll).toBeCalled();
	});

	it('should get a random recommendation', async () => {
		const recommendations = [
			recommendationFactory.createFake(20),
			recommendationFactory.createFake(15),
		];
		jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(recommendations);

		const result = await recommendationService.getRandom();

		expect(result).not.toBeNull();
	});

	it('should fail to get a random recommendation', async () => {
		jest.spyOn(recommendationRepository, 'findAll').mockResolvedValue([]);

		const promise = recommendationService.getRandom();

		return expect(promise).rejects.toEqual({
			type: 'not_found',
			message: ''
		});
	});
});