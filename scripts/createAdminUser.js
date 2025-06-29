#!/usr/bin/env node

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import readline from 'readline'
import User from '../lib/models/User.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Helper function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

// Helper function to prompt for password (with hidden input)
const promptPassword = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (password) => {
      console.log() // New line after password
      resolve(password)
    })
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.line.length === 0) {
        rl.output.write(stringToWrite)
      } else {
        rl.output.write('*')
      }
    }
  })
}

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables')
    }

    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Check if any admin users already exist
    const existingAdminCount = await User.countDocuments({ role: 'admin' })
    if (existingAdminCount > 0) {
      console.log(`\n⚠️  Warning: ${existingAdminCount} admin user(s) already exist in the database.`)
      const proceed = await prompt('Do you want to create another admin user? (yes/no): ')
      if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
        console.log('Exiting...')
        process.exit(0)
      }
    }

    console.log('\n🎾 Tennis del Parque - Create Admin User')
    console.log('=====================================\n')

    // Prompt for admin details
    const email = await prompt('Admin email: ')
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log('\n❌ Error: A user with this email already exists.')
      process.exit(1)
    }

    const password = await promptPassword('Admin password (min 8 characters): ')
    
    // Validate password
    if (password.length < 8) {
      console.log('\n❌ Error: Password must be at least 8 characters long.')
      process.exit(1)
    }

    const confirmPassword = await promptPassword('Confirm password: ')
    
    if (password !== confirmPassword) {
      console.log('\n❌ Error: Passwords do not match.')
      process.exit(1)
    }

    // Create the admin user
    console.log('\n📝 Creating admin user...')
    
    const adminUser = new User({
      email: email.toLowerCase(),
      password,
      role: 'admin',
      isActive: true,
      emailVerified: true // Auto-verify admin accounts
    })

    await adminUser.save()

    console.log('\n✅ Admin user created successfully!')
    console.log('=====================================')
    console.log(`Email: ${adminUser.email}`)
    console.log(`Role: ${adminUser.role}`)
    console.log(`ID: ${adminUser._id}`)
    console.log('\nYou can now log in to the admin panel at /admin')

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message)
    process.exit(1)
  } finally {
    // Close connections
    rl.close()
    await mongoose.connection.close()
  }
}

// Run the script
createAdminUser()
