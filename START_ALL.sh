#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Test Automation Tool - Complete Setup & Start        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js 16+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version:${NC} $(node --version)"
echo ""

# Check if MongoDB is running
echo -e "${YELLOW}Checking MongoDB connection...${NC}"
if mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${RED}✗ MongoDB is not running!${NC}"
    echo -e "${YELLOW}Please start MongoDB:${NC}"
    echo "  macOS: brew services start mongodb-community"
    echo "  Or use MongoDB Atlas (cloud)"
    echo ""
    exit 1
fi

echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"

# Backend
cd backend
echo -e "${GREEN}Installing backend dependencies...${NC}"
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi

# Seed database
echo -e "${YELLOW}Seeding database with initial data...${NC}"
npm run seed
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to seed database${NC}"
    exit 1
fi

cd ..

# Frontend
cd frontend
echo -e "${GREEN}Installing frontend dependencies...${NC}"
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ All dependencies installed successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Starting services...${NC}"
echo ""

# Start Backend
cd backend
echo -e "${GREEN}Starting Backend (port 5000)...${NC}"
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
sleep 3

cd ..

# Start Frontend
cd frontend
echo -e "${GREEN}Starting Frontend (port 5173)...${NC}"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

cd ..

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ All services are running!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Available Services:${NC}"
echo -e "  ${GREEN}Frontend:${NC}    http://localhost:5173"
echo -e "  ${GREEN}Backend:${NC}     http://localhost:5000"
echo -e "  ${GREEN}API Health:${NC}  http://localhost:5000/api/health"
echo ""

echo -e "${YELLOW}To stop all services, press Ctrl+C${NC}"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ Services stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Keep script running
wait
