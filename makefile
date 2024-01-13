# -----------------------------------------------------------------------------
# Defaults
# -----------------------------------------------------------------------------
AWS_CREDS := $(if $(AWS_CREDS),$(AWS_CREDS),~/.aws/credentials)
STAGE := $(if $(STAGE),$(STAGE),v1)
FHR_ENV := $(if $(FHR_ENV),$(FHR_ENV),dev)

# -----------------------------------------------------------------------------
# API
# -----------------------------------------------------------------------------
api-package:
	cd services/api && \
	serverless package \
		--package build \
		--stage ${STAGE} \
		--env ${FHR_ENV}

api-create-domain:
	cd services/api && \
	serverless create_domain \
		--stage ${STAGE} \
		--env ${FHR_ENV}

api-deploy:
	cd services/api && \
	serverless deploy \
		--package build \
		--stage ${STAGE} \
		--env ${FHR_ENV}

api-update:
	cd services/api && \
	serverless deploy function \
		--function ${FUNCTION} \
		--stage ${STAGE} \
		--env ${FHR_ENV}

api-delete-domain:
	cd services/api && \
	serverless delete_domain \
		--stage ${STAGE} \
		--env ${FHR_ENV}

api-remove:
	cd services/api && \
	serverless remove \
		--stage ${STAGE} \
		--env ${FHR_ENV}

api: api-package api-deploy

# -----------------------------------------------------------------------------
# Tasks
# -----------------------------------------------------------------------------
tasks-package:
	cd services/tasks && \
	serverless package \
		--package build \
		--stage ${STAGE} \
		--env ${FHR_ENV}

tasks-deploy:
	cd services/tasks && \
	serverless deploy \
		--package build \
		--stage ${STAGE} \
		--env ${FHR_ENV}

tasks-update:
	cd services/tasks && \
	serverless deploy function \
		--function ${FUNCTION} \
		--stage ${STAGE} \
		--env ${FHR_ENV}

tasks-remove:
	cd services/tasks && \
	serverless remove \
		--stage ${STAGE} \
		--env ${FHR_ENV}

tasks: tasks-package tasks-deploy

# -----------------------------------------------------------------------------
# Serverless Database
# -----------------------------------------------------------------------------
db-package:
	cd services/db && \
	serverless package \
		--package build \
		--stage ${STAGE} \
		--env ${FHR_ENV}

db-deploy:
	cd services/db && \
	serverless deploy \
		--package build \
		--stage ${STAGE} \
		--env ${FHR_ENV}

db-remove:
	cd services/db && \
	serverless remove \
		--stage ${STAGE} \
		--env ${FHR_ENV}

db: db-package db-deploy

# -----------------------------------------------------------------------------
# Serverless SQS
# -----------------------------------------------------------------------------
sqs-add-player-package:
	cd services/sqs-add-player && \
	serverless package --package build --stage ${STAGE} --env ${FHR_ENV}

sqs-add-player-deploy:
	cd services/sqs-add-player && \
	serverless deploy --package build --stage ${STAGE} --env ${FHR_ENV}

sqs-add-player-remove:
	cd services/sqs-add-player && \
	serverless remove --stage ${STAGE} --env ${FHR_ENV}

sqs-update-game-package:
	cd services/sqs-update-game && \
	serverless package --package build --stage ${STAGE} --env ${FHR_ENV}

sqs-update-game-deploy:
	cd services/sqs-update-game && \
	serverless deploy --package build --stage ${STAGE} --env ${FHR_ENV}

sqs-update-game-remove:
	cd services/sqs-update-game && \
	serverless remove --stage ${STAGE} --env ${FHR_ENV}

sqs-update-all-games-package:
	cd services/sqs-update-all-games && \
	serverless package --package build --stage ${STAGE} --env ${FHR_ENV}

sqs-update-all-games-deploy:
	cd services/sqs-update-all-games && \
	serverless deploy --package build --stage ${STAGE} --env ${FHR_ENV}

sqs-update-all-games-remove:
	cd services/sqs-update-all-games && \
	serverless remove --stage ${STAGE} --env ${FHR_ENV}

sqs: sqs-add-player-package sqs-add-player-deploy sqs-update-game-package sqs-update-game-deploy sqs-update-all-games-package sqs-update-all-games-deploy

sqs-remove: sqs-add-player-remove sqs-update-game-remove sqs-update-all-games-remove

# -----------------------------------------------------------------------------
# Deployment
# -----------------------------------------------------------------------------
deploy: db sqs api tasks

destroy: api-remove tasks-remove sqs-remove db-remove

# -----------------------------------------------------------------------------
# Test
# -----------------------------------------------------------------------------
test: "./node_modules/mocha/bin/mocha --recursive -u bdd -R list"
