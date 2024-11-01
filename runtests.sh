#!/bin/bash

# Navigate to each service directory and run tests
for dir in api-gateway orders-service inventory-service; do
  echo "Running tests in $dir..."
  (cd $dir && npm run test)
done
