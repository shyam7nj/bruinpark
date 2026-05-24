const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const SUPPORTED_FACILITIES = [
  'str 2', 'str 3', 'str 4', 'str 7', 'str 8', 'str 9', 'str 11'
];

// ─── Sender ───────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

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
          <li>Forward that email back to <strong>${GMAIL_USER}</strong></li>
          <li>
            Make sure the subject line of your forwarded email contains this verification code:
            <div style="
              margin: 12px 0; padding: 12px 20px;
              background: #f5f8fc; border-left: 4px solid #2774ae;
              font-size: 20px; font-weight: bold;
              letter-spacing: 2px; font-family: monospace;
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

// ─── HTML to readable text ────────────────────────────────────────────────────

function htmlToText(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#64;/g, '@')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Permit format validation ─────────────────────────────────────────────────

function validateDateRange(body) {
  // Allow any whitespace/characters (up to 50) between "valid for dates:" and the dates
  // to handle table-structured HTML emails where label and value are in separate cells
  const match = body.match(
    /valid\s+for\s+dates\s*:[\s\S]{0,50}?(\d{1,2}\/\d{1,2}\/\d{4})[\s\S]{0,20}?[-–—][\s\S]{0,20}?(\d{1,2}\/\d{1,2}\/\d{4})/i
  );
  if (!match) return { ok: false, reason: 'Missing or unreadable "Valid for dates" field.' };

  const [, startStr, endStr] = match;
  const start = new Date(startStr);
  const end   = new Date(endStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(start) || isNaN(end)) {
    return { ok: false, reason: 'Could not parse permit date range.' };
  }
  if (today < start) {
    return { ok: false, reason: `Permit is not yet valid — it starts on ${startStr}.` };
  }
  if (today > end) {
    return { ok: false, reason: `Permit has expired — it was valid until ${endStr}.` };
  }
  return { ok: true };
}

function validateFacility(body) {
  const match = body.match(/valid\s+for\s+facilities\s*:[\s\S]{0,50}?(str\s*\d+)/i);
  if (!match) return { ok: false, reason: 'Missing "Valid for facilities" field.' };

  const facilityText = match[1].replace(/\s+/g, ' ').toLowerCase().trim();
  // Normalise "str7" or "str 7" → "str 7"
  const normalised = facilityText.replace(/str\s*(\d+)/, 'str $1');
  const supported = SUPPORTED_FACILITIES.find(f => normalised === f);
  if (!supported) {
    return {
      ok: false,
      reason: `Facility not supported by BruinPark. Supported: ${SUPPORTED_FACILITIES.map(f => f.toUpperCase()).join(', ')}.`,
    };
  }
  return { ok: true };
}

function validatePermitFormat(body) {
  const b = body.toLowerCase();

  const checks = [
    {
      ok: b.includes('donotreply@ts.ucla.edu'),
      reason: 'Original sender DoNotReply@ts.ucla.edu not found in forwarded email.',
    },
    {
      ok: b.includes('thank you for your purchase'),
      reason: 'Missing "thank you for your purchase" — does not look like a permit confirmation.',
    },
    {
      ok: /\(\d{9}\)/.test(body),
      reason: 'Missing 9-digit UCLA student ID.',
    },
    {
      ok: /date\s*:\s*\d{1,2}\/\d{1,2}\/\d{4}/i.test(body),
      reason: 'Missing or unreadable "Date:" field.',
    },
    {
      ok: /total\s*:\s*\$[\d,]+\.\d{2}/i.test(body),
      reason: 'Missing or unreadable "Total: $" field.',
    },
    {
      ok: /basket\s*number\s*:[\s\S]{0,10}\d{8,}/i.test(body),
      reason: 'Missing or unreadable "Basket Number:" field (must be 8+ digits).',
    },
    {
      ok: b.includes('items purchased'),
      reason: 'Missing "Items purchased" section.',
    },
    {
      ok: /valid\s+for\s+vehicles\s*:/i.test(body),
      reason: 'Missing "Valid for vehicles:" field.',
    },
    {
      ok: b.includes('only one vehicle associated with your permit'),
      reason: 'Missing standard permit notice about one vehicle at a time.',
    },
    {
      ok: b.includes('map of the campus parking locations'),
      reason: 'Missing standard permit footer about campus parking map.',
    },
  ];

  for (const check of checks) {
    if (!check.ok) return { ok: false, reason: check.reason };
  }

  const dateResult = validateDateRange(body);
  if (!dateResult.ok) return dateResult;

  const facilityResult = validateFacility(body);
  if (!facilityResult.ok) return facilityResult;

  return { ok: true };
}

// ─── Inbox reader ─────────────────────────────────────────────────────────────

async function checkInboxForToken(userEmail, token) {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    logger: false,
  });

  await client.connect();

  try {
    await client.mailboxOpen('INBOX');

    const uids = await client.search({ from: userEmail }, { uid: true });
    if (!uids || uids.length === 0) {
      return {
        verified: false,
        reason: `No email found from your UCLA address. Make sure you forwarded to ${GMAIL_USER}.`,
      };
    }

    let lastReason = 'No valid permit email found.';

    for await (const msg of client.fetch(uids, { source: true }, { uid: true })) {
      const rawSource = msg.source.toString('utf-8');

      // Token check: use raw source — token is plain ASCII and will never be encoded
      if (!rawSource.toLowerCase().includes(token.toLowerCase())) continue;

      // Parse MIME to get decoded body parts
      const parsed = await simpleParser(msg.source);

      // Build best possible plain text body:
      // 1. Use parsed.text (proper plain text MIME part) if available
      // 2. Fall back to converting parsed.html (handles entity decoding + tag removal)
      // 3. Last resort: raw source (still useful for checking senders/headers)
      let bodyText = '';
      if (parsed.text && parsed.text.trim().length > 10) {
        bodyText = parsed.text;
      } else if (parsed.html) {
        bodyText = htmlToText(parsed.html);
      }

      // Always append raw source as extra layer so headers like "From: DoNotReply@..." are found
      const fullBody = bodyText + '\n' + rawSource;

      console.log('--- Decoded body sample (first 600 chars) ---');
      console.log(fullBody.slice(0, 600));
      console.log('---------------------------------------------');

      const result = validatePermitFormat(fullBody);
      if (result.ok) return { verified: true };

      console.log('Validation failed:', result.reason);
      lastReason = result.reason;
    }

    return { verified: false, reason: lastReason };
  } finally {
    await client.logout();
  }
}

module.exports = { sendVerificationEmail, checkInboxForToken };