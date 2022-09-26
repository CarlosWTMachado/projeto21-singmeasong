/* eslint-disable */
import { faker } from '@faker-js/faker';

describe('Test create recommendation', () => {
	it('create recommendation succefuly', async () => {
		const recommendation = {
			name: faker.random.word(),
			youtubeLink: 'https://youtu.be/dQw4w9WgXcQ'
		};
		cy.visit('http://localhost:3000/');
		cy.get('[data-test-id="input-name"]').type(recommendation.name);
		cy.get('[data-test-id="input-link"]').type(recommendation.youtubeLink);

		cy.intercept('POST', 'http://localhost:5000/recommendations').as('recommendations');
		cy.get('[data-test-id="button-create"]').click();
		cy.wait('@recommendations');

		cy.url().should('equal', 'http://localhost:3000/');
	});

	it('fail to create a recommendation', () => {
		const recommendation = {
			name: faker.random.word(),
			youtubeLink: 'https://www.google.com/'
		};
		cy.visit('http://localhost:3000/');
		cy.get('[data-test-id="input-name"]').type(recommendation.name);
		cy.get('[data-test-id="input-link"]').type(recommendation.youtubeLink);

		cy.intercept('POST', 'http://localhost:5000/recommendations').as('recommendations');
		cy.get('[data-test-id="button-create"]').click();
		cy.wait('@recommendations');

		cy.on('window:alert', (text) => { expect(text).to.contains('Error creating recommendation!') });
	});
});

describe('up && down vote recommendation', () => {
	it('should add a point, given upvoted recommendation', () => {
		const recommendation = {
			name: faker.random.word(),
			youtubeLink: 'https://youtu.be/dQw4w9WgXcQ'
		};
		cy.visit('http://localhost:3000/');
		cy.get('[data-test-id="input-name"]').type(recommendation.name);
		cy.get('[data-test-id="input-link"]').type(recommendation.youtubeLink);

		cy.intercept('POST', 'http://localhost:5000/recommendations').as('recommendations');
		cy.get('[data-test-id="button-create"]').click();
		cy.wait('@recommendations');

		cy.get('[data-test-id="arrow-up"]').click();
		cy.get('[data-test-id="score"]').should('contain.text', '1');
	});

	it('should remove a point, given downvoted recommendation', () => {
		const recommendation = {
			name: faker.random.word(),
			youtubeLink: 'https://youtu.be/dQw4w9WgXcQ'
		};

		cy.visit('http://localhost:3000/');
		cy.get('[data-test-id="input-name"]').type(recommendation.name);
		cy.get('[data-test-id="input-link"]').type(recommendation.youtubeLink);

		cy.intercept('POST', 'http://localhost:5000/recommendations').as('recommendations');
		cy.get('[data-test-id="button-create"]').click();
		cy.wait('@recommendations');

		cy.get('[data-test-id="arrow-down"]').click();
		cy.get('[data-test-id="score"]').should('contain.text', '-1');

	});
});