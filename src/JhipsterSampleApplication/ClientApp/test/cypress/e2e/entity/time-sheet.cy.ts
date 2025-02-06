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

describe('TimeSheet e2e test', () => {
  const timeSheetPageUrl = '/time-sheet';
  const timeSheetPageUrlPattern = new RegExp('/time-sheet(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const timeSheetSample = {};

  let timeSheet;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/time-sheets+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/time-sheets').as('postEntityRequest');
    cy.intercept('DELETE', '/api/time-sheets/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (timeSheet) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/time-sheets/${timeSheet.id}`,
      }).then(() => {
        timeSheet = undefined;
      });
    }
  });

  it('TimeSheets menu should load TimeSheets page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('time-sheet');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('TimeSheet').should('exist');
    cy.url().should('match', timeSheetPageUrlPattern);
  });

  describe('TimeSheet page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(timeSheetPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create TimeSheet page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/time-sheet/new$'));
        cy.getEntityCreateUpdateHeading('TimeSheet');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeSheetPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/time-sheets',
          body: timeSheetSample,
        }).then(({ body }) => {
          timeSheet = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/time-sheets+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [timeSheet],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(timeSheetPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details TimeSheet page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('timeSheet');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeSheetPageUrlPattern);
      });

      it('edit button click should load edit TimeSheet page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TimeSheet');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeSheetPageUrlPattern);
      });

      it('edit button click should load edit TimeSheet page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TimeSheet');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeSheetPageUrlPattern);
      });

      it('last delete button click should delete instance of TimeSheet', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('timeSheet').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeSheetPageUrlPattern);

        timeSheet = undefined;
      });
    });
  });

  describe('new TimeSheet page', () => {
    beforeEach(() => {
      cy.visit(`${timeSheetPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('TimeSheet');
    });

    it('should create an instance of TimeSheet', () => {
      cy.get(`[data-cy="timeSheetDate"]`).type('2025-02-05');
      cy.get(`[data-cy="timeSheetDate"]`).blur();
      cy.get(`[data-cy="timeSheetDate"]`).should('have.value', '2025-02-05');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        timeSheet = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', timeSheetPageUrlPattern);
    });
  });
});
