import PDFDocument from 'pdfkit';
import fs from 'fs';

const outputPath = 'C:/Users/lokes/Downloads/ReelBid_Client_Approval_Document.pdf';
const IMG = 'C:/Users/lokes/Downloads/reelbid_diagrams';
const doc = new PDFDocument({
    size: 'A4', margin: 50, bufferPages: true, info: {
        Title: 'ReelBid - Client Approval Document', Author: 'ReelBid Development Team',
    }
});
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const PURPLE = '#7C3AED'; const PINK = '#EC4899'; const AMBER = '#F59E0B';
const GRAY = '#71717A'; const BLACK = '#000000'; const WHITE = '#FFFFFF';
const PAGE_W = doc.page.width - 100;

function h1(t) { doc.moveDown(0.5); doc.font('Helvetica-Bold').fontSize(20).fillColor(PURPLE).text(t); doc.moveDown(0.2); doc.strokeColor('#E0E0E0').lineWidth(0.5).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke(); doc.moveDown(0.3); }
function h2(t) { doc.moveDown(0.4); doc.font('Helvetica-Bold').fontSize(15).fillColor(PURPLE).text(t); doc.moveDown(0.2); }
function h3(t) { doc.moveDown(0.3); doc.font('Helvetica-Bold').fontSize(12).fillColor(PURPLE).text(t); doc.moveDown(0.15); }
function p(t) { doc.font('Helvetica').fontSize(10).fillColor(BLACK).text(t, { lineGap: 3 }); doc.moveDown(0.15); }
function pb(t) { doc.font('Helvetica-Bold').fontSize(10).fillColor(BLACK).text(t, { lineGap: 3 }); doc.moveDown(0.15); }
function bl(t) { doc.font('Helvetica').fontSize(10).fillColor(BLACK).text(`  •  ${t}`, { indent: 10, lineGap: 2 }); doc.moveDown(0.1); }
function gap(n = 0.3) { doc.moveDown(n); }
function ck(n = 80) { if (doc.y > doc.page.height - n - 60) doc.addPage(); }
function note(t) { ck(40); doc.font('Helvetica-Oblique').fontSize(9).fillColor(GRAY).text(`ℹ️  ${t}`, { indent: 15 }); doc.moveDown(0.2); }

function addImage(filename, w) {
    const path = `${IMG}/${filename}`;
    if (!fs.existsSync(path)) { p(`[Image: ${filename} not found]`); return; }
    ck(300);
    const imgW = w || PAGE_W;
    const x = 50 + (PAGE_W - imgW) / 2;
    doc.image(path, x, doc.y, { width: imgW });
    doc.moveDown(0.5);
    // manually advance Y past the image
    const img = doc.openImage(path);
    const h = (imgW / img.width) * img.height;
    doc.y += h + 10;
}

function drawTable(headers, rows, colWidths) {
    const totalW = PAGE_W;
    const widths = colWidths || headers.map(() => totalW / headers.length);
    const cellPad = 5;
    const startX = 50;

    function drawRow(cells, isH) {
        ck(35);
        const y0 = doc.y;
        const heights = cells.map((c, i) => doc.font(isH ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5).heightOfString(c || '', { width: widths[i] - cellPad * 2 }) + cellPad * 2);
        const maxH = Math.max(...heights, 18);
        if (isH) doc.rect(startX, y0, totalW, maxH).fill(PURPLE);
        else doc.rect(startX, y0, totalW, maxH).fill(WHITE).stroke('#CCCCCC');
        let x = startX;
        cells.forEach((c, i) => {
            doc.rect(x, y0, widths[i], maxH).stroke('#CCCCCC');
            doc.font(isH ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5).fillColor(isH ? WHITE : BLACK)
                .text(c || '', x + cellPad, y0 + cellPad, { width: widths[i] - cellPad * 2, height: maxH - cellPad });
            x += widths[i];
        });
        doc.y = y0 + maxH;
    }
    drawRow(headers, true);
    rows.forEach(r => drawRow(r, false));
    doc.moveDown(0.4);
}

// ========== TITLE PAGE ==========
doc.moveDown(6);
doc.font('Helvetica-Bold').fontSize(42).fillColor(PURPLE).text('ReelBid', { align: 'center' });
doc.moveDown(0.3);
doc.font('Helvetica').fontSize(16).fillColor(PINK).text('Premium Movie Memorabilia Auction Platform', { align: 'center' });
doc.moveDown(1);
doc.font('Helvetica').fontSize(12).fillColor(GRAY).text('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', { align: 'center' });
doc.moveDown(1);
doc.font('Helvetica-Bold').fontSize(22).fillColor(BLACK).text('CLIENT APPROVAL DOCUMENT', { align: 'center' });
doc.moveDown(2);
doc.font('Helvetica').fontSize(12).fillColor(GRAY).text('Version: 1.0', { align: 'center' });
doc.font('Helvetica').fontSize(12).fillColor(GRAY).text('Date: 4 March 2026', { align: 'center' });
doc.font('Helvetica').fontSize(12).fillColor(GRAY).text('Prepared by: ReelBid Development Team', { align: 'center' });
doc.moveDown(0.5);
doc.font('Helvetica-Bold').fontSize(12).fillColor(AMBER).text('Status: Awaiting Client Approval', { align: 'center' });

// ========== TOC ==========
doc.addPage();
h1('Table of Contents');
['1.  Executive Summary', '2.  Project Overview', '3.  Technology Stack', '4.  System Architecture', '5.  Data Models & Database Schema', '6.  User Roles & Access Control', '7.  Role-Based Workflow — Buyer', '8.  Role-Based Workflow — Seller', '9.  Role-Based Workflow — Admin', '10. Detailed Feature Workflows', '11. Security & Integrity Mechanisms', '12. API Endpoints Reference', '13. Pages & Navigation Structure', '14. Real-Time Communication', '15. Email Notification System', '16. Payment Integration', '17. Approval Section'].forEach(t => p(t));

// ========== 1. EXECUTIVE SUMMARY ==========
doc.addPage();
h1('1. Executive Summary');
p('ReelBid is a full-stack, real-time online auction platform built specifically for premium movie memorabilia. The platform enables collectors (Buyers) to bid on exclusive items listed by verified sellers, with comprehensive administrative oversight ensuring platform integrity and trust.');
gap();
p('The platform operates on a three-pillar role-based ecosystem:');
bl('Buyers — Register, fund their wallet, browse auctions, place bids, and complete payments for won items.');
bl('Sellers — List authentic movie memorabilia, monitor auction progress, manage post-auction payment collection, and handle second-chance offers.');
bl('Admins — Oversee the entire platform including user management, role assignments, financial oversight, tier management, and withdrawal approvals.');
gap();
h2('Key Platform Highlights');
drawTable(['Feature', 'Description'], [
    ['Real-Time Bidding', 'WebSocket-powered live bid updates across all connected clients'],
    ['Sniper Protection', 'Automatic 1-hour auction extension if a bid arrives in the last 10 minutes'],
    ['Wallet & Tier System', 'Secure wallet with tier classification based on deposit balance'],
    ['HMAC Wallet Integrity', 'Server-side cryptographic hash verification prevents balance tampering'],
    ['Security Deposits', 'Dynamic deposit calculation with automatic lock/unlock/refund workflows'],
    ['Razorpay Integration', 'Secure payment gateway for winner payment completion (INR)'],
    ['Second-Chance Offers', 'Seller can offer the item to runner-up bidders if the winner defaults'],
    ['Profanity Filtering', 'Comprehensive multi-language content filter (English + Hindi)'],
    ['Email Notifications', 'Automated emails for payment reminders, auction extensions, and offers'],
], [PAGE_W * 0.3, PAGE_W * 0.7]);

// ========== 2. PROJECT OVERVIEW ==========
doc.addPage();
h1('2. Project Overview');
h2('2.1 Purpose');
p('ReelBid aims to create a trusted marketplace for movie memorabilia collectors, ensuring authenticity through seller verification, fair bidding through anti-sniper protection, and financial safety through a secure wallet system with cryptographic integrity checks.');
h2('2.2 Target Users');
drawTable(['User Type', 'Description'], [
    ['Collectors / Buyers', 'Movie memorabilia enthusiasts looking to acquire rare props, costumes, posters, and other cinematic artifacts'],
    ['Sellers', 'Verified individuals or organizations possessing authentic movie memorabilia'],
    ['Platform Administrators', 'Internal staff managing platform operations, user roles, and financial workflows'],
], [PAGE_W * 0.25, PAGE_W * 0.75]);
h2('2.3 Scope');
p('The platform covers the complete auction lifecycle:');
bl('User registration and profile completion');
bl('Wallet funding and tier assignment');
bl('Auction creation, real-time bidding, and completion');
bl('Post-auction payment collection (online via Razorpay or cash)');
bl('Security deposit management (lock, unlock, refund)');
bl('Withdrawal request and admin approval');
bl('Second-chance offer workflow for defaulting winners');

// ========== 3. TECHNOLOGY STACK ==========
doc.addPage();
h1('3. Technology Stack');
drawTable(['Layer', 'Technology', 'Purpose'], [
    ['Framework', 'Next.js 16.1.6 (React 19.2)', 'Full-stack React framework with SSR and API routes'],
    ['Language', 'TypeScript 5', 'Type-safe JavaScript for client and server'],
    ['Database', 'MongoDB (Mongoose 9.2)', 'NoSQL document database'],
    ['Authentication', 'NextAuth.js 4.24', 'OAuth (Google) + Credentials (OTP/Password)'],
    ['Real-Time', 'Socket.IO 4.8', 'WebSocket-based real-time bidding'],
    ['Payments', 'Razorpay 2.9', 'Secure payment gateway (INR)'],
    ['Email', 'Nodemailer 7.0', 'Transactional emails'],
    ['Animations', 'Framer Motion 12.34', 'UI animations and transitions'],
    ['Styling', 'Vanilla CSS + CSS Variables', 'Custom design system'],
    ['Custom Server', 'tsx + HTTP + Socket.IO', 'WebSocket support alongside Next.js'],
], [PAGE_W * 0.2, PAGE_W * 0.35, PAGE_W * 0.45]);

// ========== 4. SYSTEM ARCHITECTURE ==========
doc.addPage();
h1('4. System Architecture');
p('The following diagram illustrates the layered architecture of the ReelBid platform:');
gap();
addImage('system_architecture.png', PAGE_W);
gap();
h2('Architecture Pattern');
bl('Monolithic Full-Stack: Single Next.js application with API routes as the backend');
bl('Custom Server: HTTP server wraps Next.js with Socket.IO for real-time bidding');
bl('JWT Sessions: Stateless authentication using JSON Web Tokens');
bl('Server-Side Validation: All financial operations validated exclusively on the server');
bl('HMAC Wallet Integrity: Cryptographic hash verification on every wallet mutation');

// ========== 5. DATA MODELS ==========
doc.addPage();
h1('5. Data Models & Database Schema');
p('The application uses 6 MongoDB collections managed through Mongoose ODM:');
gap();

h2('5.1 User Model');
drawTable(['Field', 'Type', 'Description'], [
    ['name', 'String (required)', 'Full name of the user'],
    ['email', 'String (required, unique)', 'Email address for authentication'],
    ['password', 'String (optional)', 'Hashed password (optional for Google OAuth)'],
    ['role', 'Enum: Admin, Seller, Buyer', 'User role (default: Buyer)'],
    ['walletBalance', 'Number', 'Total wallet balance (INR)'],
    ['lockedBalance', 'Number', 'Amount locked as security deposits'],
    ['walletHash', 'String', 'HMAC-SHA256 integrity hash'],
    ['tier', 'String', 'Assigned tier (display only, not enforced)'],
    ['profileCompleted', 'Boolean', 'Buyer profile completion flag'],
    ['address, city, state, pincode', 'String', 'Shipping address fields'],
], [PAGE_W * 0.25, PAGE_W * 0.3, PAGE_W * 0.45]);

ck(250);
h2('5.2 Item (Auction) Model');
drawTable(['Field', 'Type', 'Description'], [
    ['title / description', 'String (required)', 'Item title and description'],
    ['images', 'String[]', 'Array of image URLs'],
    ['startingPrice / currentPrice', 'Number', 'Base price and current highest bid'],
    ['securityPercentage', 'Number (1-50%)', 'Security deposit percentage (default: 5%)'],
    ['highestBidder / winner', 'ObjectId → User', 'Current / winning bidder'],
    ['seller', 'ObjectId → User', 'Seller who listed the item'],
    ['startDate / endDate', 'Date (required)', 'Auction timeframe'],
    ['status', 'Enum: Draft, Active, Completed, Cancelled', 'Auction lifecycle status'],
    ['winnerPaymentStatus', 'Enum: pending, paid, failed', 'Payment tracking'],
    ['paymentMethod', 'Enum: cash, online, bank_transfer', 'Payment method used'],
    ['shippingAddress', 'Object', 'Winner\'s shipping address'],
    ['secondChanceStatus', 'Enum: closed, open', 'Second-chance availability'],
    ['secondChanceOffers', 'Array', 'Runner-up offers submitted'],
], [PAGE_W * 0.25, PAGE_W * 0.3, PAGE_W * 0.45]);

ck(200);
h2('5.3 Bid Model');
drawTable(['Field', 'Type', 'Description'], [
    ['amount', 'Number (required)', 'Bid amount in INR'],
    ['user / item', 'ObjectId', 'Bidder and auction references'],
    ['isTopBid', 'Boolean', 'Whether this is the current highest bid'],
    ['lockedDeposit', 'Number', 'Security deposit locked for this bid'],
    ['depositRefunded', 'Boolean', 'Whether deposit has been refunded'],
    ['status', 'Enum: active, outbid, won, lost, refunded', 'Bid lifecycle status'],
], [PAGE_W * 0.25, PAGE_W * 0.3, PAGE_W * 0.45]);

ck(120);
h2('5.4 Tier Model');
drawTable(['Field', 'Type', 'Description'], [
    ['name', 'String (unique)', 'Tier name (e.g., "Tier A")'],
    ['minBalance', 'Number', 'Minimum wallet balance to qualify'],
    ['bidLimit', 'Number', 'Max bid amount (NOT enforced in bidding)'],
    ['order', 'Number', 'Sort order (higher = better tier)'],
], [PAGE_W * 0.25, PAGE_W * 0.3, PAGE_W * 0.45]);
note('Tiers are assigned based on wallet balance but bidLimit is NOT enforced during bid placement. It exists for future use.');

ck(180);
h2('5.5 WalletTransaction Model');
drawTable(['Field', 'Type', 'Description'], [
    ['user', 'ObjectId → User', 'Transaction owner'],
    ['type', 'Enum: credit, debit, lock, unlock, refund, payment', 'Transaction type'],
    ['amount', 'Number', 'Transaction amount'],
    ['description', 'String', 'Human-readable description'],
    ['balanceAfter / lockedAfter', 'Number', 'Post-transaction balances'],
    ['status', 'Enum: completed, pending, failed', 'Transaction status'],
], [PAGE_W * 0.25, PAGE_W * 0.3, PAGE_W * 0.45]);

ck(150);
h2('5.6 WithdrawRequest Model');
drawTable(['Field', 'Type', 'Description'], [
    ['user', 'ObjectId → User', 'Requester'],
    ['amount', 'Number', 'Withdrawal amount'],
    ['bankName / accountName', 'String', 'Bank and account holder name'],
    ['accountNumber', 'String', 'Account number (9-18 digits)'],
    ['ifscCode', 'String', 'Bank IFSC code'],
    ['status', 'Enum: pending, approved, rejected', 'Approval status'],
    ['adminNotes', 'String', 'Admin notes (rejection reason, etc.)'],
], [PAGE_W * 0.25, PAGE_W * 0.3, PAGE_W * 0.45]);

// ========== 6. ROLES & ACCESS ==========
doc.addPage();
h1('6. User Roles & Access Control');
h2('6.1 Role Hierarchy');
p('The diagram below illustrates the three roles and their relationships within the ReelBid ecosystem:');
gap();
addImage('role_hierarchy.png', PAGE_W);
gap();

h2('6.2 Permission Matrix');
drawTable(['Permission', 'Buyer', 'Seller', 'Admin'], [
    ['Register / Sign In', 'YES', 'YES', 'YES'],
    ['Complete Profile', 'YES (Required)', 'NO', 'NO'],
    ['Place Bids', 'YES', 'NO', 'NO'],
    ['Fund Wallet / Withdraw', 'YES', 'NO', 'NO'],
    ['Create / Edit Auctions', 'NO', 'YES', 'NO'],
    ['Close Auctions Early', 'NO', 'YES (own)', 'YES (any)'],
    ['View Winner Details', 'NO', 'YES (own)', 'YES'],
    ['Send Payment Reminders', 'NO', 'YES (own)', 'YES'],
    ['Mark as Paid (Cash)', 'NO', 'YES (own)', 'YES'],
    ['Initiate Second-Chance', 'NO', 'YES (own)', 'YES'],
    ['Submit Second-Chance Offer', 'YES (runner-ups)', 'NO', 'NO'],
    ['Manage Users / Delete', 'NO', 'NO', 'YES'],
    ['Manage Tiers', 'NO', 'NO', 'YES'],
    ['Approve/Reject Withdrawals', 'NO', 'NO', 'YES'],
    ['View Platform Statistics', 'NO', 'NO', 'YES'],
    ['View Leaderboard', 'YES', 'YES', 'YES'],
], [PAGE_W * 0.35, PAGE_W * 0.18, PAGE_W * 0.2, PAGE_W * 0.27]);

// ========== 7. BUYER WORKFLOW ==========
doc.addPage();
h1('7. Role-Based Workflow — Buyer');
h2('7.1 Buyer Journey Overview');
p('The following diagram shows the complete buyer journey from registration to receiving the won item:');
gap();
addImage('buyer_workflow.png', PAGE_W);
gap();

h2('7.2 Registration & Onboarding');
p('Step 1: User visits ReelBid and chooses a sign-up method (Google OAuth, Email+OTP, or Email+Password).');
p('Step 2: Account is created with Role: Buyer, Tier: None, Wallet: INR 0.');
p('Step 3: Buyer is redirected to the Profile Completion page.');
p('Step 4: Buyer enters: Full Name, Address, City, State, Pincode, Phone Number.');
p('Step 5: Profile is marked as complete. Buyer can now access the Buyer Dashboard.');
gap();

h2('7.3 Wallet Top-Up Flow');
p('1. Buyer navigates to Wallet section on the dashboard.');
p('2. Enters the top-up amount (INR 1 to INR 5,00,000 per transaction).');
p('3. Server validates the amount (type check, finite check, range check).');
p('4. Amount credited to walletBalance. HMAC wallet hash is re-signed.');
p('5. Tier is auto-computed based on new balance. WalletTransaction (type: credit) is recorded.');
gap();

h2('7.4 Withdrawal Flow');
p('1. Buyer enters: Amount (min INR 100), Bank Name, Account Name, Account Number (9-18 digits), IFSC Code.');
p('2. Server validates all fields including IFSC format (^[A-Z]{4}0[A-Z0-9]{6}$).');
p('3. Available balance checked (walletBalance - lockedBalance). Amount deducted immediately.');
p('4. HMAC hash re-signed. WithdrawRequest created with status: "pending".');
p('5. Admin reviews and approves or rejects. If rejected, amount is refunded to wallet.');
gap();

ck(100);
h2('7.5 Tier System (Classification Only)');
p('Tiers are dynamically configured by the Admin. Each tier has: Name, Minimum Balance, Bid Limit, and Sort Order. However, the bidLimit field is NOT currently enforced during bid placement — it exists in the data model for potential future use.');
bl('Tiers are assigned automatically when a buyer tops up their wallet');
bl('The tier name is displayed on the user profile and dashboard');
bl('Bidding is restricted only by available wallet balance for security deposits, NOT by tier bidLimit');
gap();

ck(300);
h2('7.6 Bidding Workflow');
p('Step 1: Browse active auctions. Select auction to view details (price, time remaining, bid history).');
p('Step 2: Enter bid amount (must exceed current price and be >= starting price).');
p('Step 3: Server validates: Buyer role, not own item, auction Active, bid exceeds current price.');
gap();
pb('Security Deposit Calculation:');
bl('First bid <= INR 80K: Deposit = ceil(bid × securityPercentage%)');
bl('First bid > INR 80K: Base deposit + extra for each INR 10K step above INR 80K');
bl('Subsequent bids: Progressive doubling formula based on bid ratio');
bl('Already-locked amounts are subtracted from the new requirement');
gap();
p('Step 4: Additional deposit locked from available balance. HMAC re-signed.');
p('Step 5: Previous top bid marked "outbid". New bid created (isTopBid: true).');
p('Step 6: Item currentPrice and highestBidder updated.');
p('Step 7 (Sniper Protection): If bid within last 10 min → auction extended 1 hour, top 10 bidders emailed.');
p('Step 8: Real-time WebSocket broadcast to all auction viewers.');
gap();

ck(200);
h2('7.7 Post-Auction Payment (Winner)');
p('1. Auction completes — highest bidder declared winner.');
p('2. Winner\'s security deposit adjusted into payment (deducted from wallet, unlocked from lockedBalance).');
p('3. Remaining amount = Winning Price - Total Locked Deposit.');
p('4. Winner enters shipping address (with profanity check).');
p('5. Razorpay order created for remaining amount. Winner completes payment.');
p('6. Razorpay signature verified server-side. Payment status marked "paid".');
gap();

h2('7.8 Second-Chance Offer (Runner-Up Buyer)');
p('1. Runner-up receives email about second-chance opportunity.');
p('2. Logs in, views winning amount, selects offer adjustment (-5% to +5%).');
p('3. Submits offer. Seller reviews and accepts or rejects.');

// ========== 8. SELLER WORKFLOW ==========
doc.addPage();
h1('8. Role-Based Workflow — Seller');
h2('8.1 Seller Journey Overview');
p('The following diagram shows the complete seller workflow from onboarding through auction management:');
gap();
addImage('seller_workflow.png', PAGE_W);
gap();

h2('8.2 Seller Onboarding');
pb('IMPORTANT: Sellers cannot self-register.');
p('1. User registers as a Buyer first.');
p('2. Contacts the Admin with proof of authenticity for their memorabilia.');
p('3. Admin reviews the request and, if approved, changes role to "Seller".');
p('4. User now has access to the Seller Dashboard.');
gap();

h2('8.3 Auction Creation');
p('1. Seller opens "Create Auction" form on the Seller Dashboard.');
p('2. Fills in: Title, Description, Category. Uploads images (base64 encoded).');
p('3. Sets Starting Price, Security Deposit % (1-50%), Start Date, End Date.');
p('4. Profanity check is performed on all text fields.');
p('5. If valid, Item is created with status: "Active". Goes live immediately.');
gap();

h2('8.4 Auction Management Actions');
drawTable(['Action', 'Description', 'Condition'], [
    ['View All Auctions', 'See all listings with status, bids, current price', 'Always'],
    ['Edit Auction', 'Update title, description, images, dates, price, security %', 'Active only'],
    ['Close Auction Early', 'Manually end an active auction', 'Seller or Admin'],
    ['View Top 5 Bidders', 'See ranked bidders with full details after completion', 'Completed'],
    ['Send Payment Reminder', 'Email the auction winner to complete payment', 'Winner unpaid'],
    ['Mark as Paid (Cash)', 'Manually update payment status for offline payment', 'Cash scenario'],
    ['Activate Second-Chance', 'Email top 4 runner-ups if winner defaults', 'Winner defaulted'],
    ['Date Filtering', 'Filter auctions by date range (from/to)', 'Always'],
], [PAGE_W * 0.25, PAGE_W * 0.45, PAGE_W * 0.3]);
gap();

h2('8.5 Post-Auction Detail View');
p('When an auction completes, the seller can view:');
bl('Winner\'s full information: Name, Email, Phone, Complete Shipping Address');
bl('Top 5 bidders ranked by highest bid, with bid counts and deposit amounts');
bl('Payment status (Pending / Paid) and remaining amount');
bl('Action buttons: Send Reminder, Mark as Paid, Activate Second-Chance');
gap();

h2('8.6 Second-Chance Offer Flow (Seller Side)');
p('1. Winner fails to pay → Seller clicks "Activate Second Chance".');
p('2. System emails top 4 runner-up bidders with offer details.');
p('3. Each runner-up can submit offers within ±5% of the winning bid.');
p('4. Offers appear on seller\'s auction detail page. Seller accepts or rejects.');

// ========== 9. ADMIN WORKFLOW ==========
doc.addPage();
h1('9. Role-Based Workflow — Admin');
h2('9.1 Admin Dashboard Overview');
p('The Admin has full platform control through a comprehensive dashboard:');
gap();
addImage('admin_workflow.png', PAGE_W);
gap();

h2('9.2 Dashboard Sections');
drawTable(['Section', 'Capabilities'], [
    ['📊 Statistics', 'Total users, items, bids, transactions, active/completed auctions, revenue, locked deposits'],
    ['👥 User Management', 'View all users, change roles (Buyer↔Seller↔Admin), delete users, search'],
    ['📦 Auctions', 'View all auctions, force-close any active auction'],
    ['🏷️ Tier Management', 'Create, edit, delete tier configurations (classification only)'],
    ['💳 Withdrawals', 'Review pending withdrawal requests, approve or reject with notes'],
    ['💰 Wallet Flow', 'View aggregated wallet statistics by transaction type'],
], [PAGE_W * 0.2, PAGE_W * 0.8]);
gap();

h2('9.3 User Management');
p('1. View all users with Name, Email, Role, Wallet Balance, Tier.');
p('2. Search and filter users by name or email.');
p('3. Change any user\'s role to Admin, Seller, or Buyer.');
p('4. Delete any user (self-deletion is prevented server-side).');
gap();

h2('9.4 Tier Management');
p('1. Create new tiers with: Name, Min Balance, Bid Limit (not enforced), Sort Order.');
p('2. Delete existing tiers. Tiers auto-apply to users based on wallet balance.');
gap();

h2('9.5 Withdrawal Approval');
p('1. View pending requests: User, Amount, Bank Details, Date.');
p('2. Approve: Withdrawal marked approved, funds transferred externally.');
p('3. Reject: Enter notes, amount refunded to user wallet, HMAC re-signed, credit transaction recorded.');
gap();

h2('9.6 Auction Force-Close');
p('1. Select any active auction and force-close it.');
p('2. Highest bidder declared winner, deposit adjusted into payment.');
p('3. All losing bidders\' deposits are refunded. Status set to "Completed".');

// ========== 10. DETAILED FEATURES ==========
doc.addPage();
h1('10. Detailed Feature Workflows');

h2('10.1 Complete Auction Lifecycle');
p('The auction goes through 6 distinct phases from creation to completion:');
gap();
addImage('auction_lifecycle.png', PAGE_W);
gap();

pb('Phase 1 — Creation');
p('Seller creates auction with title, description, images, starting price, security %, and date range. Status: Active.');
pb('Phase 2 — Bidding');
p('Buyers browse and bid in real-time. Security deposits locked per bid. WebSocket updates broadcast. Sniper protection extends auctions if bids arrive in final 10 minutes.');
pb('Phase 3 — Completion');
p('Auction end date reached or seller/admin force-closes. Highest bidder = winner. Winner deposit adjusted, losers refunded.');
pb('Phase 4 — Payment');
p('Winner pays remaining amount (winning price minus locked deposit) via Razorpay. Alternatively, seller marks cash payment.');
pb('Phase 5 — Delivery');
p('Seller views winner\'s name, phone, address. Ships item directly to winner.');
pb('Phase 6 — Second-Chance (if winner defaults)');
p('Seller activates second-chance. Top 4 runner-ups emailed. They submit offers at ±5% of winning bid. Seller selects best offer.');
gap();

ck(200);
h2('10.2 Authentication Flow');
p('Three authentication methods are supported:');
bl('Google OAuth: Redirects to Google, returns with verified identity');
bl('Email + OTP: User enters email → OTP sent → OTP verified → Session created');
bl('Email + Password: User enters credentials → Validated → Session created');
p('All methods create a Buyer account if not existing. JWT tokens for stateless sessions. Buyers must complete profile before dashboard access.');
gap();

h2('10.3 Wallet Integrity Verification');
p('Every wallet mutation follows this security protocol:');
p('1. Load user from database.');
p('2. assertWalletIntegrity() — recomputes HMAC-SHA256 and compares with stored hash.');
p('3. If mismatch → SECURITY ALERT: operation blocked, user must contact support.');
p('4. If valid → perform wallet mutation.');
p('5. resignWallet() — compute new HMAC hash, save to user document.');
p('Uses crypto.timingSafeEqual() to prevent timing attacks.');

// ========== 11. SECURITY ==========
doc.addPage();
h1('11. Security & Integrity Mechanisms');
p('ReelBid implements multiple layers of security to protect users and the platform:');
gap();
addImage('security_mechanisms.png', PAGE_W);
gap();

h2('11.1 Wallet Security (HMAC-SHA256)');
drawTable(['Mechanism', 'Details'], [
    ['Algorithm', 'HMAC-SHA256'],
    ['Secret', 'NEXTAUTH_SECRET (never exposed to client)'],
    ['Payload Format', 'userId|walletBalance|lockedBalance'],
    ['Verification', 'crypto.timingSafeEqual() to prevent timing attacks'],
    ['When Verified', 'Before EVERY wallet mutation (top-up, bid, refund, withdrawal)'],
    ['When Re-signed', 'After EVERY wallet mutation, before user.save()'],
], [PAGE_W * 0.3, PAGE_W * 0.7]);

h2('11.2 Server-Side Validation');
drawTable(['Check', 'Details'], [
    ['Amount Validation', 'typeof === "number", Number.isFinite(), range checks'],
    ['Max Top-up Cap', 'Single top-up capped at INR 5,00,000'],
    ['Min Withdrawal', 'Minimum withdrawal amount: INR 100'],
    ['IFSC Validation', 'Regex: ^[A-Z]{4}0[A-Z0-9]{6}$'],
    ['Account Number', 'Regex: ^\\d{9,18}$'],
    ['Balance Source', 'All balance checks use database values, NEVER client-provided data'],
    ['Self-Bidding Prevention', 'Sellers cannot bid on their own auctions'],
    ['Self-Deletion Prevention', 'Admins cannot delete their own account'],
], [PAGE_W * 0.3, PAGE_W * 0.7]);

h2('11.3 Anti-Sniper Protection');
drawTable(['Feature', 'Implementation'], [
    ['Trigger', 'Bid placed with ≤ 10 minutes remaining on auction'],
    ['Action', 'Auction end date automatically extended by 1 hour'],
    ['Notification', 'Email sent to top 10 bidders about the extension'],
    ['Purpose', 'Prevents last-second sniping, ensures fair competition'],
], [PAGE_W * 0.3, PAGE_W * 0.7]);

ck(150);
h2('11.4 Content Safety (Profanity Filter)');
drawTable(['Feature', 'Implementation'], [
    ['Word List', '100+ banned words (English + Hindi)'],
    ['L33tspeak Detection', 'Character substitution map (@ → a, ! → i, $ → s, etc.)'],
    ['Multi-version Check', '4 normalized text versions checked against word list'],
    ['Wildcard Patterns', 'Catches f**k, s**t, b**ch type obfuscations'],
    ['Applied To', 'Auction titles, descriptions, shipping addresses'],
], [PAGE_W * 0.3, PAGE_W * 0.7]);

// ========== 12. API ENDPOINTS ==========
doc.addPage();
h1('12. API Endpoints Reference (32 Total)');

h2('12.1 Authentication APIs (6)');
drawTable(['Method', 'Endpoint', 'Description'], [
    ['POST', '/api/register', 'Register new buyer account'],
    ['*', '/api/auth/[...nextauth]', 'NextAuth.js authentication handler'],
    ['POST', '/api/otp/send', 'Send OTP for registration'],
    ['POST', '/api/otp/verify', 'Verify registration OTP'],
    ['POST', '/api/otp/signin-send', 'Send OTP for sign-in'],
    ['POST', '/api/otp/signin-verify', 'Verify sign-in OTP'],
], [PAGE_W * 0.12, PAGE_W * 0.4, PAGE_W * 0.48]);

h2('12.2 Profile APIs (4)');
drawTable(['Method', 'Endpoint', 'Description'], [
    ['GET', '/api/profile', 'Get user profile'],
    ['GET/POST', '/api/profile/complete', 'Check / complete profile'],
    ['PUT', '/api/profile/password', 'Update password'],
    ['PUT', '/api/profile/update-name', 'Update display name'],
], [PAGE_W * 0.12, PAGE_W * 0.4, PAGE_W * 0.48]);

h2('12.3 Auction & Item APIs (4)');
drawTable(['Method', 'Endpoint', 'Description'], [
    ['GET', '/api/items', 'List all auction items'],
    ['GET', '/api/auctions/[id]/second-chance', 'Get second-chance details'],
    ['POST', '/api/auctions/[id]/second-chance', 'Submit second-chance offer'],
    ['GET/POST', '/api/auctions/complete', 'Complete auction / Get summary'],
], [PAGE_W * 0.12, PAGE_W * 0.4, PAGE_W * 0.48]);

h2('12.4 Bidding APIs (3)');
drawTable(['Method', 'Endpoint', 'Description'], [
    ['GET', '/api/bids?itemId=X', 'Get top bids for an item'],
    ['GET', '/api/bids?userId=X', 'Get user\'s bid history'],
    ['POST', '/api/bids', 'Place a new bid'],
], [PAGE_W * 0.12, PAGE_W * 0.4, PAGE_W * 0.48]);

ck(200);
h2('12.5 Wallet APIs (5)');
drawTable(['Method', 'Endpoint', 'Description'], [
    ['GET', '/api/wallet', 'Get wallet info + transactions'],
    ['POST', '/api/wallet', 'Top-up wallet balance'],
    ['GET', '/api/wallet/transactions', 'Get transaction history'],
    ['GET', '/api/wallet/withdraw', 'Get withdrawal request history'],
    ['POST', '/api/wallet/withdraw', 'Submit withdrawal request'],
], [PAGE_W * 0.12, PAGE_W * 0.4, PAGE_W * 0.48]);

h2('12.6 Payment APIs (2)');
drawTable(['Method', 'Endpoint', 'Description'], [
    ['POST', '/api/payment', 'Create Razorpay payment order for winner'],
    ['POST', '/api/payment/verify', 'Verify Razorpay payment signature'],
], [PAGE_W * 0.12, PAGE_W * 0.4, PAGE_W * 0.48]);

ck(200);
h2('12.7 Seller APIs (5)');
drawTable(['Method', 'Endpoint', 'Description'], [
    ['GET/POST/PUT', '/api/seller/items', 'Manage seller\'s auction items'],
    ['GET', '/api/seller/auction/[id]', 'Auction detail with top bidders'],
    ['POST', '/api/seller/auction/[id]/notify', 'Send payment reminder to winner'],
    ['POST', '/api/seller/auction/[id]/offer', 'Activate second-chance offers'],
    ['POST', '/api/seller/auction/[id]/payment', 'Mark payment as completed (cash)'],
], [PAGE_W * 0.12, PAGE_W * 0.4, PAGE_W * 0.48]);

h2('12.8 Admin APIs (6)');
drawTable(['Method', 'Endpoint', 'Description'], [
    ['GET', '/api/admin/stats', 'Get platform statistics'],
    ['PUT', '/api/admin/users', 'Change user role'],
    ['DELETE', '/api/admin/users?userId=X', 'Delete a user'],
    ['GET/POST/DELETE', '/api/admin/tiers', 'Manage tier configurations'],
    ['GET', '/api/admin/withdrawals', 'List all withdrawal requests'],
    ['PUT', '/api/admin/withdrawals/[id]', 'Approve/reject withdrawal request'],
], [PAGE_W * 0.12, PAGE_W * 0.4, PAGE_W * 0.48]);

h2('12.9 Other APIs (2)');
drawTable(['Method', 'Endpoint', 'Description'], [
    ['GET', '/api/leaderboard', 'Get global leaderboard data'],
    ['GET', '/api/tiers', 'Get all tier configurations'],
], [PAGE_W * 0.12, PAGE_W * 0.4, PAGE_W * 0.48]);

// ========== 13. PAGES ==========
doc.addPage();
h1('13. Pages & Navigation Structure');
drawTable(['Page', 'Route', 'Description'], [
    ['Home', '/', 'Landing page with hero section, featured auctions, process steps, stats'],
    ['Sign In', '/auth/signin', 'Login with Google OAuth, Email+OTP, or Email+Password'],
    ['Register', '/auth/register', 'New user registration'],
    ['Auctions', '/auctions', 'Browse all active auctions with search and filtering'],
    ['Auction Detail', '/auctions/[id]', 'Individual auction with bidding interface, real-time updates'],
    ['Dashboard', '/dashboard', 'Role-based dashboard (Buyer / Seller / Admin)'],
    ['Profile Completion', '/profile/complete', 'Mandatory for Buyers: enter address and phone'],
    ['Leaderboard', '/leaderboard', 'Global rankings: Top Collectors, Highest Pledges, Most Active'],
    ['Working Process', '/working-process', 'Role-by-role guide to how ReelBid works'],
    ['Settings', '/settings/profile', 'Profile settings and management'],
], [PAGE_W * 0.18, PAGE_W * 0.27, PAGE_W * 0.55]);
gap();
h2('Dashboard Component Views');
drawTable(['Role', 'Component', 'Key Features'], [
    ['Buyer', 'BuyerDashboard.tsx', 'Wallet overview, top-up, withdraw, active bids, won auctions, date filtering'],
    ['Seller', 'SellerDashboard.tsx', 'Stats cards, auction list, create/edit, close auction, auction detail, date filtering'],
    ['Admin', 'AdminDashboard.tsx', 'Platform stats, user mgmt, auction mgmt, tier mgmt, withdrawals, wallet flow'],
], [PAGE_W * 0.1, PAGE_W * 0.25, PAGE_W * 0.65]);

// ========== 14. REAL-TIME ==========
doc.addPage();
h1('14. Real-Time Communication (WebSocket)');
drawTable(['Component', 'Technology', 'Purpose'], [
    ['Server', 'Socket.IO on custom HTTP server', 'Broadcast auction events to connected clients'],
    ['Client', 'socket.io-client', 'Receive real-time updates on auction pages'],
    ['Rooms', 'Per-auction rooms (itemId)', 'Scope updates to viewers of specific auctions'],
], [PAGE_W * 0.2, PAGE_W * 0.4, PAGE_W * 0.4]);
gap();
h2('WebSocket Events');
drawTable(['Event', 'Direction', 'Data', 'Trigger'], [
    ['joinRoom', 'Client → Server', 'itemId', 'User opens auction detail page'],
    ['leaveRoom', 'Client → Server', 'itemId', 'User leaves auction page'],
    ['bidUpdated', 'Server → Clients', 'newPrice, endDate, highestBidderId, bidCount', 'New bid placed successfully'],
    ['auctionCompleted', 'Server → Clients', 'itemId, winnerId, finalPrice', 'Auction marked as completed'],
], [PAGE_W * 0.2, PAGE_W * 0.18, PAGE_W * 0.37, PAGE_W * 0.25]);

// ========== 15. EMAIL ==========
gap();
h1('15. Email Notification System');
drawTable(['Email Type', 'Trigger', 'Recipients', 'Content'], [
    ['Auction Extended', 'Sniper protection activated', 'Top 10 bidders', 'Auction extended by 1 hour notification'],
    ['Payment Reminder', 'Seller sends reminder', 'Auction winner', 'Congratulations + payment link + final amount'],
    ['Second-Chance', 'Seller activates second-chance', 'Top 4 runner-ups', 'Item available, ±5% price range, offer link'],
], [PAGE_W * 0.18, PAGE_W * 0.22, PAGE_W * 0.18, PAGE_W * 0.42]);
gap();
h2('Email Infrastructure');
drawTable(['Setting', 'Details'], [
    ['Transport', 'SMTP via Nodemailer'],
    ['From Address', 'noreply@reelbid.com (configurable)'],
    ['Template Style', 'HTML emails with dark theme, gradient headers, branded design'],
    ['Configuration', 'EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD'],
], [PAGE_W * 0.25, PAGE_W * 0.75]);

// ========== 16. PAYMENT ==========
doc.addPage();
h1('16. Payment Integration');
p('The following diagram shows the complete payment and wallet flow:');
gap();
addImage('payment_flow.png', PAGE_W);
gap();

h2('16.1 Razorpay Integration');
drawTable(['Feature', 'Details'], [
    ['Gateway', 'Razorpay (Indian payments)'],
    ['Currency', 'INR (₹)'],
    ['Flow', 'Create Order → Client-side Checkout → Server-side Signature Verification'],
    ['Signature Verification', 'HMAC-SHA256 using RAZORPAY_KEY_SECRET'],
    ['Receipt Format', 'rb_{auctionId_last8}_{timestamp_base36}'],
], [PAGE_W * 0.3, PAGE_W * 0.7]);
gap();

h2('16.2 Payment Calculation');
p('Winning Amount = Item.finalAmount || Item.currentPrice');
p('Locked Deposit = Sum of all user\'s bids\' lockedDeposit on this auction');
p('Remaining Amount = max(0, Winning Amount − Locked Deposit)');
gap();

h2('16.3 Payment Methods');
drawTable(['Method', 'Flow'], [
    ['Online (Razorpay)', 'Winner pays remaining amount via Razorpay → Signature verified → Status: paid'],
    ['Cash', 'Winner pays seller in cash → Seller clicks "Mark as Paid" → Status: paid'],
    ['Bank Transfer', 'Supported in schema, manual process'],
], [PAGE_W * 0.25, PAGE_W * 0.75]);

// ========== 17. APPROVAL ==========
doc.addPage();
h1('17. Approval Section');
gap();
drawTable(['Item', 'Details'], [
    ['Document Reviewed By', '__________________________________________'],
    ['Date', '__________________________________________'],
    ['Client Approval', '☐ Approved     ☐ Approved with Changes     ☐ Rejected'],
    ['Comments / Change Requests', ''],
    ['', ''],
    ['', ''],
    ['', ''],
    ['Client Signature', '__________________________________________'],
    ['Date', '__________________________________________'],
], [PAGE_W * 0.3, PAGE_W * 0.7]);

gap(2);
doc.font('Helvetica-Oblique').fontSize(9).fillColor(GRAY).text('This document is generated based on the actual codebase of the ReelBid application.', { align: 'center' });
doc.text('All features, workflows, and technical specifications described herein are implemented and functional.', { align: 'center' });
gap();
doc.font('Helvetica-Bold').fontSize(11).fillColor(PURPLE).text('ReelBid — Premium Movie Memorabilia Auctions', { align: 'center' });
doc.font('Helvetica').fontSize(9).fillColor(GRAY).text('Document Version 1.0 — 4 March 2026', { align: 'center' });

doc.end();
stream.on('finish', () => console.log('✅ PDF with visual diagrams saved to: ' + outputPath));
