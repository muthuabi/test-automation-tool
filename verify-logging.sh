#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Test Automation Tool - Logging Verification${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check 1: Worker file exists
echo -e "${YELLOW}[1/5]${NC} Checking worker file location..."
if [ -f "backend/src/workers/executionWorker.js" ]; then
    echo -e "${GREEN}✓${NC} Worker file found at backend/src/workers/executionWorker.js"
else
    echo -e "${RED}✗${NC} Worker file NOT found at backend/src/workers/executionWorker.js"
    echo "      Expected location: backend/src/workers/executionWorker.js"
fi

# Check 2: WorkerPool file exists
echo -e "\n${YELLOW}[2/5]${NC} Checking worker pool file..."
if [ -f "backend/src/utils/workerPool.js" ]; then
    echo -e "${GREEN}✓${NC} Worker pool file found"
    # Check if it has logging
    if grep -q "\[POOL\]" "backend/src/utils/workerPool.js"; then
        echo -e "${GREEN}✓${NC} Worker pool has logging enabled"
    else
        echo -e "${RED}✗${NC} Worker pool missing logging"
    fi
else
    echo -e "${RED}✗${NC} Worker pool file NOT found"
fi

# Check 3: Routes file has logging
echo -e "\n${YELLOW}[3/5]${NC} Checking execution route logging..."
if grep -q "EXECUTION REQUEST" "backend/src/routes/runs.js"; then
    echo -e "${GREEN}✓${NC} Execute endpoint has logging"
else
    echo -e "${RED}✗${NC} Execute endpoint missing logging"
fi

# Check 4: ExecutionWorker has logging
echo -e "\n${YELLOW}[4/5]${NC} Checking execution worker logging..."
if grep -q "\[WORKER\]" "backend/src/workers/executionWorker.js"; then
    echo -e "${GREEN}✓${NC} Execution worker has logging"
else
    echo -e "${RED}✗${NC} Execution worker missing logging"
fi

# Check 5: Settings default structure
echo -e "\n${YELLOW}[5/5]${NC} Checking settings default structure..."
if grep -q "enabled: false" "backend/src/controllers/settingsController.js"; then
    echo -e "${GREEN}✓${NC} Settings has default structure"
else
    echo -e "${RED}✗${NC} Settings missing default structure"
fi

echo -e "\n${BLUE}================================================${NC}"
echo -e "${BLUE}   Verification Complete${NC}"
echo -e "${BLUE}================================================${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Start backend: cd backend && npm start"
echo "2. Open frontend: http://localhost:5173"
echo "3. Click Play button on a scenario"
echo "4. Watch backend terminal for logs with [POOL], [EXECUTE API], and [WORKER] prefixes"
echo -e "\n${YELLOW}Expected log output:${NC}"
echo "  ✓ Worker pool initializing with 3 workers"
echo "  ✓ ========== EXECUTION REQUEST ==========="
echo "  ✓ ========== ASSIGNING WORKER ==========="
echo "  ✓ [WORKER] execution progress messages"
echo "  ✓ ========== WORKER RELEASED ==========="
