# -----------------------------------------------------------------------------
# Defaults
# -----------------------------------------------------------------------------
AWS_CREDS := $(if $(AWS_CREDS),$(AWS_CREDS),~/.aws/credentials)
REGION := $(if $(REGION), $(REGION), 'us-west-2')
FHR_ENV := $(if $(FHR_ENV),$(FHR_ENV),dev)

# -----------------------------------------------------------------------------
# API
# -----------------------------------------------------------------------------
api-package:
	cd services/api && \
	sls package \
		--package build

api-create-domain:
	cd services/api && \
	sls create_domain

api-deploy:
	cd services/api && \
	sls deploy \
		--package build

api-update:
	cd services/api && \
	sls deploy function \
		--function ${FUNCTION}

api-delete-domain:
	cd services/api && \
	sls delete_domain

api-remove:
	cd services/api && \
	sls remove

api: api-package api-deploy

# -----------------------------------------------------------------------------
# Tasks
# -----------------------------------------------------------------------------
tasks-package:
	cd services/tasks && \
	sls package \
		--package build

tasks-deploy:
	cd services/tasks && \
	sls deploy \
		--package build

tasks-update:
	cd services/tasks && \
	sls deploy function \
		--function ${FUNCTION}

tasks-remove:
	cd services/tasks && \
	sls remove

tasks: tasks-package tasks-deploy

# -----------------------------------------------------------------------------
# sls Database
# -----------------------------------------------------------------------------
db-package:
	cd services/db && \
	sls package \
		--package build

db-deploy:
	cd services/db && \
	sls deploy \
		--package build

db-remove:
	cd services/db && \
	sls remove

db: db-package db-deploy

# -----------------------------------------------------------------------------
# sls SQS
# -----------------------------------------------------------------------------
sqs-add-player-package:
	cd services/sqs-add-player && \
	sls package --package build

sqs-add-player-deploy:
	cd services/sqs-add-player && \
	sls deploy --package build

sqs-add-player-remove:
	cd services/sqs-add-player && \
	sls remove

sqs-update-game-package:
	cd services/sqs-update-game && \
	sls package

sqs-update-game-deploy:
	cd services/sqs-update-game && \
	sls deploy --package build

sqs-update-game-remove:
	cd services/sqs-update-game && \
	sls remove

sqs-update-all-games-package:
	cd services/sqs-update-all-games && \
	sls package --package build

sqs-update-all-games-deploy:
	cd services/sqs-update-all-games && \
	sls deploy --package build

sqs-update-all-games-remove:
	cd services/sqs-update-all-games && \
	sls remove

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
