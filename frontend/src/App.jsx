import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Selectors from './pages/Selectors';
import Functions from './pages/Functions';
import Scenarios from './pages/Scenarios';
import Runs from './pages/Runs';
import Results from './pages/Results';
import AdoSettings from './pages/AdoSettings';
import TeamsSettings from './pages/TeamsSettings';
import EmailSettings from './pages/EmailSettings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/users"
            element={
              <Layout>
                <Users />
              </Layout>
            }
          />
          <Route
            path="/selectors"
            element={
              <Layout>
                <Selectors />
              </Layout>
            }
          />
          <Route
            path="/functions"
            element={
              <Layout>
                <Functions />
              </Layout>
            }
          />
          <Route
            path="/scenarios"
            element={
              <Layout>
                <Scenarios />
              </Layout>
            }
          />
          <Route
            path="/runs"
            element={
              <Layout>
                <Runs />
              </Layout>
            }
          />
          <Route
            path="/results"
            element={
              <Layout>
                <Results />
              </Layout>
            }
          />
          <Route
            path="/settings/ado"
            element={
              <Layout>
                <AdoSettings />
              </Layout>
            }
          />
          <Route
            path="/settings/teams"
            element={
              <Layout>
                <TeamsSettings />
              </Layout>
            }
          />
          <Route
            path="/settings/email"
            element={
              <Layout>
                <EmailSettings />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
