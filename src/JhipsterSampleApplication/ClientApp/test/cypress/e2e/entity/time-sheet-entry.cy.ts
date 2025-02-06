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

describe('TimeSheetEntry e2e test', () => {
  const timeSheetEntryPageUrl = '/time-sheet-entry';
  const timeSheetEntryPageUrlPattern = new RegExp('/time-sheet-entry(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const timeSheetEntrySample = {};

  let timeSheetEntry;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/time-sheet-entries+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/time-sheet-entries').as('postEntityRequest');
    cy.intercept('DELETE', '/api/time-sheet-entries/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (timeSheetEntry) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/time-sheet-entries/${timeSheetEntry.id}`,
      }).then(() => {
        timeSheetEntry = undefined;
      });
    }
  });

  it('TimeSheetEntries menu should load TimeSheetEntries page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('time-sheet-entry');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('TimeSheetEntry').should('exist');
    cy.url().should('match', timeSheetEntryPageUrlPattern);
  });

  describe('TimeSheetEntry page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(timeSheetEntryPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create TimeSheetEntry page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/time-sheet-entry/new$'));
        cy.getEntityCreateUpdateHeading('TimeSheetEntry');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeSheetEntryPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/time-sheet-entries',
          body: timeSheetEntrySample,
        }).then(({ body }) => {
          timeSheetEntry = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/time-sheet-entries+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [timeSheetEntry],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(timeSheetEntryPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details TimeSheetEntry page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('timeSheetEntry');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeSheetEntryPageUrlPattern);
      });

      it('edit button click should load edit TimeSheetEntry page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TimeSheetEntry');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeSheetEntryPageUrlPattern);
      });

      it('edit button click should load edit TimeSheetEntry page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TimeSheetEntry');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeSheetEntryPageUrlPattern);
      });

      it('last delete button click should delete instance of TimeSheetEntry', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('timeSheetEntry').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeSheetEntryPageUrlPattern);

        timeSheetEntry = undefined;
      });
    });
  });

  describe('new TimeSheetEntry page', () => {
    beforeEach(() => {
      cy.visit(`${timeSheetEntryPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('TimeSheetEntry');
    });

    it('should create an instance of TimeSheetEntry', () => {
      cy.get(`[data-cy="activityName"]`).type('convoke willing reprove');
      cy.get(`[data-cy="activityName"]`).should('have.value', 'convoke willing reprove');

      cy.get(`[data-cy="startTimeMilitary"]`).type('1056');
      cy.get(`[data-cy="startTimeMilitary"]`).should('have.value', '1056');

      cy.get(`[data-cy="endTimeMilitary"]`).type('22031');
      cy.get(`[data-cy="endTimeMilitary"]`).should('have.value', '22031');

      cy.get(`[data-cy="totalTime"]`).type('5740.28');
      cy.get(`[data-cy="totalTime"]`).should('have.value', '5740.28');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        timeSheetEntry = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', timeSheetEntryPageUrlPattern);
    });
  });
});
