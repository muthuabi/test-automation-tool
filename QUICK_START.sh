#!/bin/bash

# Test Automater Platform - Quick Start Script
# This script starts all three servers needed for the platform

echo "🤖 Test Automater Platform - Starting All Servers..."
echo ""
echo "This will start 3 services:"
echo "  1. Frontend (React) on http://localhost:5173"
echo "  2. Backend (API) on http://localhost:5000"
echo "  3. Demo Site on http://localhost:4000"
echo ""
echo "Make sure you have 3 terminal windows open, then run:"
echo ""
echo "Terminal 1 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Terminal 2 (Backend):"
echo "  cd backend && npm start"
echo ""
echo "Terminal 3 (Demo Site):"
echo "  cd demo-site && python -m http.server 4000"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "Demo login credentials:"
echo "  Username: testuser"
echo "  Password: pass123"
