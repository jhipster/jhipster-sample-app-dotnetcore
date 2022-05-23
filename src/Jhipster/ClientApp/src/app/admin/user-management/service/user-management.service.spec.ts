import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";

import { User } from "../user-management.model";

import { UserManagementService } from "./user-management.service";

describe("User Service", () => {
  let service: UserManagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(UserManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe("Service methods", () => {
    it("should return User", () => {
      let expectedResult: string | undefined;

      service.find("user").subscribe((received) => {
        expectedResult = received.login;
      });

      const req = httpMock.expectOne({ method: "GET" });
      req.flush(new User("ABC", "user"));
      expect(expectedResult).toEqual("user");
    });

    it("should propagate not found response", () => {
      let expectedResult = 0;

      service.find("user").subscribe({
        error: (error: HttpErrorResponse) => (expectedResult = error.status),
      });

      const req = httpMock.expectOne({ method: "GET" });
      req.flush("Invalid request parameters", {
        status: 404,
        statusText: "Bad Request",
      });
      expect(expectedResult).toEqual(404);
    });
  });
});
