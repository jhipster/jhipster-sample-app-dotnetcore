using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Options;

namespace MyCompany.Test.Setup {
    public class MockHttpContextFactory : IHttpContextFactory {
        private readonly DefaultHttpContextFactory _delegate;
        private readonly MockClaimsPrincipalProvider _mockClaimsPrincipalProvider;

        public MockHttpContextFactory(IOptions<FormOptions> formOptions,
            MockClaimsPrincipalProvider mockClaimsPrincipalProvider, IServiceProvider serviceProvider)
        {
            _delegate = new DefaultHttpContextFactory(serviceProvider);
            _mockClaimsPrincipalProvider = mockClaimsPrincipalProvider;
        }

        public MockHttpContextFactory(IOptions<FormOptions> formOptions, IHttpContextAccessor httpContextAccessor,
            MockClaimsPrincipalProvider mockClaimsPrincipalProvider, IServiceProvider serviceProvider)
        {
            _delegate = new DefaultHttpContextFactory(serviceProvider);
            _mockClaimsPrincipalProvider = mockClaimsPrincipalProvider;
        }

        public HttpContext Create(IFeatureCollection featureCollection)
        {
            var httpContext = _delegate.Create(featureCollection);
            httpContext.User = _mockClaimsPrincipalProvider.User;
            return httpContext;
        }

        public void Dispose(HttpContext httpContext)
        {
            _delegate.Dispose(httpContext);
        }
    }
}
