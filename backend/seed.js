require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./src/db/connection');

const User = require('./src/models/usersModel');
const Selector = require('./src/models/selectorsModel');
const Function = require('./src/models/functionsModel');
const Scenario = require('./src/models/scenariosModel');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Selector.deleteMany({}),
      Function.deleteMany({}),
      Scenario.deleteMany({}),
    ]);

    console.log('✓ Cleared existing data');

    // Seed users
    const users = await User.insertMany([
      {
        email: 'testuser@example.com',
        name: 'Test User',
        role: 'Admin',
        status: 'Active',
      },
      {
        email: 'qa@example.com',
        name: 'QA Engineer',
        role: 'QA Engineer',
        status: 'Active',
      },
      {
        email: 'dev@example.com',
        name: 'Developer',
        role: 'Developer',
        status: 'Active',
      },
      {
        email: 'tester@example.com',
        name: 'Test Engineer',
        role: 'Test Engineer',
        status: 'Active',
      },
    ]);

    console.log(`✓ Created ${users.length} users`);

    // Seed selectors
    const selectors = await Selector.insertMany([
      {
        name: 'login_username',
        value: '#username',
        page: 'login',
        description: 'Username input field on login page',
        type: 'css',
      },
      {
        name: 'login_password',
        value: '#password',
        page: 'login',
        description: 'Password input field on login page',
        type: 'css',
      },
      {
        name: 'login_button',
        value: '#loginBtn',
        page: 'login',
        description: 'Login button on login page',
        type: 'css',
      },
      {
        name: 'success_message',
        value: '.success-message',
        page: 'home',
        description: 'Success message on home page',
        type: 'css',
      },
      {
        name: 'navbar_logout',
        value: '#logoutBtn',
        page: 'home',
        description: 'Logout button in navbar',
        type: 'css',
      },
    ]);

    console.log(`✓ Created ${selectors.length} selectors`);

    // Seed functions
    const functions = await Function.insertMany([
      {
        name: 'LoginToApp',
        description: 'Login to application with username and password',
        code: `async function LoginToApp(page, vars, selectors) {
  try {
    await page.goto(vars.baseUrl + '/login');
    await page.fill(selectors.login_username, vars.username);
    await page.fill(selectors.login_password, vars.password);
    await page.click(selectors.login_button);
    await page.waitForSelector(selectors.success_message, { timeout: 5000 });
    return { success: true, message: 'Login successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}`,
        status: 'Active',
      },
      {
        name: 'ValidateHomePage',
        description: 'Validate that home page loaded correctly',
        code: `async function ValidateHomePage(page, vars, selectors) {
  try {
    const pageTitle = await page.title();
    const text = await page.textContent('body');
    return { 
      success: true, 
      message: 'Home page validated',
      data: { pageTitle }
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}`,
        status: 'Active',
      },
    ]);

    console.log(`✓ Created ${functions.length} functions`);

    // Seed scenarios
    const scenarios = await Scenario.insertMany([
      {
        name: 'Complete Login Flow',
        description: 'Full login and validation scenario',
        functionIds: [functions[0]._id, functions[1]._id],
        functionNames: ['LoginToApp', 'ValidateHomePage'],
        status: 'Active',
        owner: users[0]._id,
      },
    ]);

    console.log(`✓ Created ${scenarios.length} scenarios`);

    console.log('\n✓ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
