import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';

describe('JobHistory e2e test', () => {
  const jobHistoryPageUrl = '/job-history';
  const jobHistoryPageUrlPattern = new RegExp('/job-history(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const jobHistorySample = {};

  let jobHistory;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/job-histories+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/job-histories').as('postEntityRequest');
    cy.intercept('DELETE', '/api/job-histories/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (jobHistory) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/job-histories/${jobHistory.id}`,
      }).then(() => {
        jobHistory = undefined;
      });
    }
  });

  it('JobHistories menu should load JobHistories page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('job-history');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('JobHistory').should('exist');
    cy.url().should('match', jobHistoryPageUrlPattern);
  });

  describe('JobHistory page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(jobHistoryPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create JobHistory page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/job-history/new$'));
        cy.getEntityCreateUpdateHeading('JobHistory');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', jobHistoryPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/job-histories',
          body: jobHistorySample,
        }).then(({ body }) => {
          jobHistory = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/job-histories+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/job-histories?page=0&size=20>; rel="last",<http://localhost/api/job-histories?page=0&size=20>; rel="first"',
              },
              body: [jobHistory],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(jobHistoryPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details JobHistory page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('jobHistory');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', jobHistoryPageUrlPattern);
      });

      it('edit button click should load edit JobHistory page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('JobHistory');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', jobHistoryPageUrlPattern);
      });

      it('edit button click should load edit JobHistory page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('JobHistory');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', jobHistoryPageUrlPattern);
      });

      it('last delete button click should delete instance of JobHistory', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('jobHistory').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', jobHistoryPageUrlPattern);

        jobHistory = undefined;
      });
    });
  });

  describe('new JobHistory page', () => {
    beforeEach(() => {
      cy.visit(`${jobHistoryPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('JobHistory');
    });

    it('should create an instance of JobHistory', () => {
      cy.get(`[data-cy="startDate"]`).type('2025-02-06T12:09');
      cy.get(`[data-cy="startDate"]`).blur();
      cy.get(`[data-cy="startDate"]`).should('have.value', '2025-02-06T12:09');

      cy.get(`[data-cy="endDate"]`).type('2025-02-05T22:54');
      cy.get(`[data-cy="endDate"]`).blur();
      cy.get(`[data-cy="endDate"]`).should('have.value', '2025-02-05T22:54');

      cy.get(`[data-cy="language"]`).select('FRENCH');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        jobHistory = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', jobHistoryPageUrlPattern);
    });
  });
});
