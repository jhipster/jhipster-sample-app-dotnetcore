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

describe('PieceOfWork e2e test', () => {
  const pieceOfWorkPageUrl = '/piece-of-work';
  const pieceOfWorkPageUrlPattern = new RegExp('/piece-of-work(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const pieceOfWorkSample = {};

  let pieceOfWork;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/piece-of-works+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/piece-of-works').as('postEntityRequest');
    cy.intercept('DELETE', '/api/piece-of-works/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (pieceOfWork) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/piece-of-works/${pieceOfWork.id}`,
      }).then(() => {
        pieceOfWork = undefined;
      });
    }
  });

  it('PieceOfWorks menu should load PieceOfWorks page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('piece-of-work');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('PieceOfWork').should('exist');
    cy.url().should('match', pieceOfWorkPageUrlPattern);
  });

  describe('PieceOfWork page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(pieceOfWorkPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create PieceOfWork page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/piece-of-work/new$'));
        cy.getEntityCreateUpdateHeading('PieceOfWork');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', pieceOfWorkPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/piece-of-works',
          body: pieceOfWorkSample,
        }).then(({ body }) => {
          pieceOfWork = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/piece-of-works+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [pieceOfWork],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(pieceOfWorkPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details PieceOfWork page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('pieceOfWork');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', pieceOfWorkPageUrlPattern);
      });

      it('edit button click should load edit PieceOfWork page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PieceOfWork');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', pieceOfWorkPageUrlPattern);
      });

      it('edit button click should load edit PieceOfWork page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PieceOfWork');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', pieceOfWorkPageUrlPattern);
      });

      it('last delete button click should delete instance of PieceOfWork', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('pieceOfWork').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', pieceOfWorkPageUrlPattern);

        pieceOfWork = undefined;
      });
    });
  });

  describe('new PieceOfWork page', () => {
    beforeEach(() => {
      cy.visit(`${pieceOfWorkPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PieceOfWork');
    });

    it('should create an instance of PieceOfWork', () => {
      cy.get(`[data-cy="title"]`).type('beneath');
      cy.get(`[data-cy="title"]`).should('have.value', 'beneath');

      cy.get(`[data-cy="description"]`).type('where cruel hm');
      cy.get(`[data-cy="description"]`).should('have.value', 'where cruel hm');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        pieceOfWork = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', pieceOfWorkPageUrlPattern);
    });
  });
});
