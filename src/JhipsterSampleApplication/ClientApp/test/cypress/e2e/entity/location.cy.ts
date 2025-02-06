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

describe('Location e2e test', () => {
  const locationPageUrl = '/location';
  const locationPageUrlPattern = new RegExp('/location(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const locationSample = {};

  let location;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/locations+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/locations').as('postEntityRequest');
    cy.intercept('DELETE', '/api/locations/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (location) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/locations/${location.id}`,
      }).then(() => {
        location = undefined;
      });
    }
  });

  it('Locations menu should load Locations page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('location');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Location').should('exist');
    cy.url().should('match', locationPageUrlPattern);
  });

  describe('Location page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(locationPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Location page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/location/new$'));
        cy.getEntityCreateUpdateHeading('Location');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', locationPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/locations',
          body: locationSample,
        }).then(({ body }) => {
          location = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/locations+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [location],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(locationPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Location page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('location');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', locationPageUrlPattern);
      });

      it('edit button click should load edit Location page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Location');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', locationPageUrlPattern);
      });

      it('edit button click should load edit Location page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Location');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', locationPageUrlPattern);
      });

      it('last delete button click should delete instance of Location', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('location').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', locationPageUrlPattern);

        location = undefined;
      });
    });
  });

  describe('new Location page', () => {
    beforeEach(() => {
      cy.visit(`${locationPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Location');
    });

    it('should create an instance of Location', () => {
      cy.get(`[data-cy="streetAddress"]`).type('over of');
      cy.get(`[data-cy="streetAddress"]`).should('have.value', 'over of');

      cy.get(`[data-cy="postalCode"]`).type('however elegantly');
      cy.get(`[data-cy="postalCode"]`).should('have.value', 'however elegantly');

      cy.get(`[data-cy="city"]`).type('East Millercester');
      cy.get(`[data-cy="city"]`).should('have.value', 'East Millercester');

      cy.get(`[data-cy="stateProvince"]`).type('shocked beret');
      cy.get(`[data-cy="stateProvince"]`).should('have.value', 'shocked beret');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        location = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', locationPageUrlPattern);
    });
  });
});
