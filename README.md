# Fantasy Homeruns API
![FHR API CI](https://github.com/Fantasy-Homeruns/fhr-api/workflows/FHR%20API%20CI/badge.svg)

Fantasy Homeruns is a not-for-profit baseball game that tracks one statistic, homeruns.  FHR is a season long game.   This repos is the new open source version of the API.  Recently in 2020, FHR decided to open source and collaborate with the community to build the next generation of FHR using serverless for API and latest React for the web application.

## Contribute
We are very excited to collaborate with you.

To contribute:
* Review our [Open Issues](https://github.com/Fantasy-Homeruns/fhr-api/issues)
* Fork the repos locally
* Create a new feature branch with the Issue, ex: feature/123-new-endpoint
* Submit a PR for Review

Please be sure to include quality tests with all new features.
Encourage all to improve the tests we currently have!

## Development
The API uses AWS for all managed services including API Gateway, Lambda, DynamoDB, SQS.   Standing up a development environment is simple and affordable (all of the services are based on volume and can be left online at no charge to you).

Setup your config:
* Create dev config: Copy services/config/default.json to dev.json

## Deploy
```
export FHR_ENV=dev
make deploy
```

### Destroy
```
make destroy
```
