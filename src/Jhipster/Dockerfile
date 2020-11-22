# Based on Microsoft's docker samples for dotnet core
# available at https://github.com/dotnet/dotnet-docker/tree/master/samples/aspnetapp
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
# First install nodejs - required to build generated client app
WORKDIR /app
RUN apt-get update -yq && apt-get install -yq curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get update && \
    apt-get install -yq nodejs && \
    rm -rf /var/lib/apt/lists/*

# Restore dependencies of .net core projects taking advantage of docker layer caching
COPY src/*/*.csproj ./src/
RUN for file in $(ls src/*.csproj); do mkdir -p ${file%.*} && mv $file ${file%.*}; done
RUN dotnet restore "src/Jhipster/Jhipster.csproj"

# Copy everything else and build app
COPY . ./
WORKDIR src/Jhipster
RUN dotnet publish "Jhipster.csproj" -c Release -o /app/out

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:5.0-alpine AS runtime
WORKDIR /app
EXPOSE 80
COPY --from=build /app/out .

# See: https://github.com/dotnet/announcements/issues/20
# Uncomment to enable globalization APIs (or delete)
#ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT false
#RUN apk add --no-cache icu-libs
#ENV LC_ALL en_US.UTF-8
#ENV LANG en_US.UTF-8

ENTRYPOINT ["dotnet", "jhipster.dll"]
