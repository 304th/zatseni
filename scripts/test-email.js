// Test script for Resend email
// Run: node --env-file=.env.local test-email.js

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('Sending test email...');
    console.log('From:', process.env.RESEND_FROM);

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM || 'onboarding@resend.dev',
      to: 'avkulpin@yandex.ru', // CHANGE THIS to your email
      subject: 'Test Email from Otzovik.ai',
      html: '<h1>It works!</h1><p>Resend is configured correctly.</p>',
    });

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', data.id);
    console.log('Check your inbox and https://resend.com/emails');
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error(error);
  }
}

testEmail();
