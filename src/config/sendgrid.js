const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const msg = {
      to,
      from: process.env.FROM_EMAIL,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    await sgMail.send(msg);
    console.log('✅ Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

const testSendGridConnection = async () => {
  try {
    // Test with a simple validation call
    await sgMail.send({
      to: process.env.FROM_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: 'SendGrid Test',
      html: '<p>Test email from your application</p>'
    });
    console.log('✅ SendGrid connection successful');
    return true;
  } catch (error) {
    console.error('❌ SendGrid connection failed:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  testSendGridConnection
};