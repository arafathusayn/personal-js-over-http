#!/bin/bash

deno run --allow-env=PORT,HOSTNAME,ACCESS_TOKEN,RATE_LIMIT_WINDOW,RATE_LIMIT_MAX_REQ,TIMEOUT --allow-net mod.ts