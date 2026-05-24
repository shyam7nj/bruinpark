/*
  mailService.js
  Handles sending verification emails (via nodemailer + Gmail App Password)
  and checking the inbox for forwarded replies (via imapflow).
*/

const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// ─── Sender ──────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

/*
  Sends a verification email to the user's UCLA address.
  The email instructs them to forward their permit confirmation
  and include the unique token in the subject line.
*/
async function sendVerificationEmail(toEmail, userName, token) {
  await transporter.sendMail({
    from: `"BruinPark Verification" <${GMAIL_USER}>`,
    to: toEmail,
    subject: `BruinPark Permit Verification — ${token}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px;">
        <h2 style="color: #2774ae;">BruinPark Permit Verification</h2>
        <p>Hi ${userName},</p>
        <p>To verify your UCLA parking permit on BruinPark, please follow these steps:</p>
        <ol>
          <li>Find your parking permit confirmation email from 
            <strong>DoNotReply@ts.ucla.edu</strong></li>
          <li>Forward that email back to 
            <strong>${GMAIL_USER}</strong></li>
          <li>
            Make sure the subject line of your forwarded email contains this verification code:
            <div style="
              margin: 12px 0;
              padding: 12px 20px;
              background: #f5f8fc;
              border-left: 4px solid #2774ae;
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 2px;
              font-family: monospace;
            ">${token}</div>
            (It will be included automatically if you reply to or forward this email.)
          </li>
          <li>Return to BruinPark and click <strong>"Check Verification"</strong>.</li>
        </ol>
        <p style="color: #6b7280; font-size: 13px;">
          This code is unique to your account. Do not share it.
        </p>
      </div>
    `,
  });
}

// ─── Inbox Reader ─────────────────────────────────────────────────────────────

/*
  Connects to bruinparkverify@gmail.com via IMAP and searches for an email that:
    1. Was sent by the user's UCLA email address
    2. Contains their unique verification token
    3. Contains "donotreply@ts.ucla.edu" in the body (the forwarded permit sender)

  Returns true if a valid email is found, false otherwise.
*/
async function checkInboxForToken(userEmail, token) {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
    logger: false,
  });

  await client.connect();

  try {
    await client.mailboxOpen('INBOX');

    // Search for any email from the user
    const uids = await client.search({ from: userEmail }, { uid: true });

    if (!uids || uids.length === 0) return false;

    // Check each email for the token and the original permit sender
    for await (const msg of client.fetch(uids, { source: true }, { uid: true })) {
      const raw = msg.source.toString('utf-8').toLowerCase();

      const hasToken = raw.includes(token.toLowerCase());
      const hasPermitSender = raw.includes('donotreply@ts.ucla.edu');

      if (hasToken && hasPermitSender) {
        return true;
      }
    }

    return false;
  } finally {
    await client.logout();
  }
}

module.exports = { sendVerificationEmail, checkInboxForToken };