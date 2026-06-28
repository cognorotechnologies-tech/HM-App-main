#!/bin/bash
echo "Running Type Check..."
npm run type-check || echo "Type Check Failed"
echo "Running Lint..."
npm run lint || echo "Lint Failed"
echo "Running Build..."
npm run build || echo "Build Failed"
