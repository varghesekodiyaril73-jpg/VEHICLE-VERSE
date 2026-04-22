/**
 * VehicleVerse Chatbot Engine v2
 * Self-contained keyword-matching engine + dynamic API data formatting
 * No external AI APIs needed — runs entirely in the browser
 */

// ═══════════════════════════════════════════════════════════
// KNOWLEDGE BASE — Static intents with keyword matching
// ═══════════════════════════════════════════════════════════

const knowledgeBase = [
    {
        intent: 'greeting',
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'],
        weight: 1,
        responses: [
            "Hello! 👋 Welcome to VehicleVerse! How can I help you today?",
            "Hi there! 🚗 I'm your VehicleVerse assistant. What can I do for you?",
            "Hey! Great to see you. Need help with bookings, mechanics, or something else?"
        ],
        quickReplies: ['Book a Service', 'Emergency Breakdown', 'Find a Mechanic', 'Check Pricing']
    },
    {
        intent: 'book_service',
        keywords: ['book', 'service', 'schedule', 'appointment', 'maintenance', 'servicing', 'book service', 'schedule service', 'regular service', 'routine'],
        weight: 3,
        responses: [
            "🔧 **Book a Service** — We offer two types:\n\n• **Regular Service** — Scheduled maintenance, oil change, brake check, etc.\n  → No upfront payment needed!\n  → After a mechanic accepts, pay ₹1,000 confirmation fee.\n\n• **Emergency Breakdown** — Immediate roadside assistance\n  → Requires ₹1,500 minimum advance payment upfront.\n  → Mechanic dispatched immediately after payment.\n\nGo to **Book Service** from your dashboard to get started!",
        ],
        quickReplies: ['Emergency Breakdown', 'How Payment Works', 'Find a Mechanic', 'My Bookings']
    },
    {
        intent: 'emergency',
        keywords: ['emergency', 'breakdown', 'urgent', 'stuck', 'roadside', 'stranded', 'help now', 'immediate', 'tow', 'accident', 'broke down', 'wont start', 'flat tire'],
        weight: 4,
        responses: [
            "🚨 **Emergency Breakdown Service**\n\nDon't worry, we're here to help! Here's the process:\n\n1. Click **\"Book Emergency Service\"** on your dashboard\n2. Select your vehicle and describe the issue\n3. Share your location (district & place)\n4. Pay a minimum advance of **₹1,500** (via Card or UPI)\n5. Your request goes live — verified mechanics nearby can accept\n6. A mechanic will be dispatched ASAP!\n\n⏱️ Mechanics typically arrive within **30 minutes**.\n\n💰 After the job is done, the mechanic sets a final amount. If the final amount exceeds your advance, you'll need to confirm and pay the difference. Stay safe!",
        ],
        quickReplies: ['How Payment Works', 'Refund Policy', 'Contact Support']
    },
    {
        intent: 'find_mechanic',
        keywords: ['mechanic', 'find mechanic', 'nearby', 'available', 'technician', 'expert', 'specialist', 'who can fix', 'available mechanic', 'mechanic available', 'online mechanic', 'show mechanic', 'list mechanic'],
        weight: 3,
        dynamic: true,  // This intent fetches live data
        dynamicType: 'mechanics',
        responses: [
            "🔍 **Finding available mechanics for you...**"
        ],
        quickReplies: ['Book a Service', 'How Payment Works']
    },
    {
        intent: 'pricing',
        keywords: ['price', 'pricing', 'cost', 'charge', 'fee', 'rate', 'how much', 'expensive', 'cheap', 'affordable', 'amount', 'tariff'],
        weight: 3,
        responses: [
            "💰 **Service Pricing Guide**\n\nPricing depends on the service type and mechanic:\n\n| Service | Starting From |\n|---|---|\n| Oil Change | ₹500 |\n| General Service | ₹1,500 |\n| Brake Service | ₹800 |\n| Engine Repair | ₹2,000 |\n| AC Service | ₹1,200 |\n| Battery Service | ₹600 |\n| Tire Repair | ₹400 |\n| Emergency Breakdown | ₹1,500 |\n\n⚠️ **Note:** These are starting prices. The mechanic will set the final amount after completing the work. You'll be able to review, confirm, or dispute it before paying.\n\n💡 The exact cost depends on your vehicle model and the work required.",
        ],
        quickReplies: ['How Payment Works', 'Book a Service', 'Find a Mechanic']
    },
    {
        intent: 'payment_process',
        keywords: ['payment', 'pay', 'how to pay', 'payment process', 'payment method', 'card', 'upi', 'advance', 'how payment works', 'payment procedure', 'money', 'transaction', 'payment flow', 'pay online', 'handling money'],
        weight: 4,
        responses: [
            "💳 **How Payment Works on VehicleVerse**\n\n**🔴 Emergency Booking Payment:**\n1. Pay a minimum **₹1,500 advance** at booking time\n2. Choose **Credit/Debit Card** or **UPI** as payment method\n3. Mechanic arrives and completes the job\n4. Mechanic sets the **final amount** based on work done\n5. You **review & confirm** the final amount\n6. If final > advance → you pay the **remaining balance**\n7. If final < advance → the **difference is refunded**\n\n**🟢 Regular Service Payment:**\n1. Book the service — **no upfront payment**\n2. Wait for a mechanic to accept your request\n3. Once accepted, pay **₹1,000 confirmation fee** (Card/UPI)\n4. Service is performed at the scheduled time\n5. Mechanic sets the **final amount** after completion\n6. You **review & confirm** the final amount\n7. Pay any remaining balance or receive a refund\n\n**🔒 Payment Security:**\n• All payments are processed securely\n• Card details are validated (Luhn check)\n• UPI IDs are verified before processing\n• You can **dispute** the final amount if you disagree\n\n**📍 Payment Methods Accepted:**\n• 💳 Credit/Debit Card (Visa, Mastercard)\n• 📱 UPI (Google Pay, PhonePe, etc.)",
        ],
        quickReplies: ['Refund Policy', 'Book a Service', 'My Bookings', 'Contact Support']
    },
    {
        intent: 'refund',
        keywords: ['refund', 'money back', 'refund policy', 'cancellation refund', 'get money back', 'cancel refund', 'dispute', 'overcharged'],
        weight: 4,
        responses: [
            "💸 **Refund & Dispute Policy**\n\n**When You Get a Refund:**\n• If you cancel a **pending booking** before a mechanic accepts → **Full refund**\n• If the **final amount < advance paid** → Difference refunded automatically\n• If the mechanic cancels → **Full refund of advance**\n\n**Payment Disputes:**\n• When the mechanic sets the final amount, you can:\n  ✅ **Confirm** — Accept the amount and pay balance\n  ❌ **Dispute** — Enter the amount you think is fair\n• Disputed payments are reviewed by our admin team\n• Resolution typically within **24-48 hours**\n\n**Filing a Complaint:**\n• Go to **My Bookings** → Select booking → **File Complaint**\n• Select complaint type: Payment Issue, Service Quality, etc.\n• Admin team will investigate and respond\n\n📧 For urgent refund issues, contact support.",
        ],
        quickReplies: ['How Payment Works', 'Contact Support', 'My Bookings']
    },
    {
        intent: 'booking_status',
        keywords: ['status', 'booking status', 'track', 'tracking', 'where is', 'my booking', 'my bookings', 'order', 'progress', 'update', 'check booking', 'show booking', 'show my booking'],
        weight: 3,
        dynamic: true,
        dynamicType: 'bookings',
        responses: [
            "📋 **Fetching your bookings...**"
        ],
        quickReplies: ['Book a Service', 'Contact Support']
    },
    {
        intent: 'cancel_booking',
        keywords: ['cancel', 'cancellation', 'cancel booking', 'cancel service', 'dont want', 'remove booking'],
        weight: 3,
        responses: [
            "❌ **Cancel a Booking**\n\nTo cancel a booking:\n\n1. Go to **My Bookings** from your dashboard\n2. Find the booking you want to cancel\n3. Click the **Cancel** button\n\n**Cancellation Rules:**\n• **Pending bookings** (no mechanic yet) → Can cancel freely → **Full refund**\n• **Accepted bookings** (mechanic assigned) → Cancellation may involve a processing fee\n• **In-progress bookings** → Cannot cancel — contact support instead\n\n💡 The refund for advance payments is processed automatically.",
        ],
        quickReplies: ['Refund Policy', 'My Bookings', 'Contact Support']
    },
    {
        intent: 'vehicles',
        keywords: ['vehicle', 'car', 'bike', 'add vehicle', 'my vehicles', 'register vehicle', 'registration', 'two wheeler', 'four wheeler'],
        weight: 2,
        responses: [
            "🚗 **Manage Your Vehicles**\n\nFrom the **My Vehicles** page, you can:\n\n• **Add a new vehicle** — Enter brand, model, year, and registration number\n• **View all vehicles** — See your registered vehicles at a glance\n• **Edit details** — Update vehicle information anytime\n• **Delete vehicles** — Remove vehicles you no longer own\n\nYou need at least one registered vehicle to book a service!",
        ],
        quickReplies: ['Book a Service', 'Find a Mechanic', 'My Bookings']
    },
    {
        intent: 'working_hours',
        keywords: ['hours', 'working hours', 'open', 'timing', 'available when', 'time', 'when open', 'operating hours', 'business hours'],
        weight: 2,
        responses: [
            "🕐 **Working Hours**\n\n• **Regular Services:** Mon–Sat, 8:00 AM – 8:00 PM\n• **Emergency Services:** Available **24/7** 🚨\n• **Customer Support:** Mon–Sun, 9:00 AM – 9:00 PM\n\nYou can book a regular service at any time, and it will be scheduled during working hours. Emergency services are always available!",
        ],
        quickReplies: ['Book a Service', 'Emergency Breakdown', 'Contact Support']
    },
    {
        intent: 'contact_support',
        keywords: ['contact', 'support', 'help', 'complaint', 'issue', 'problem', 'report', 'feedback', 'talk to someone', 'customer care', 'email', 'phone'],
        weight: 2,
        responses: [
            "📞 **Contact Support**\n\nNeed more help? Here's how:\n\n• **File a Complaint** — Go to **My Bookings** → select a booking → **File Complaint**\n  → Types: Emergency Delay, Service Quality, Payment Dispute, Other\n• **Email** — support@vehicleverse.com\n• **Response Time** — Within 24 hours\n\nFor payment disputes, use the **Confirm/Dispute** option when the mechanic sets the final amount.",
        ],
        quickReplies: ['My Bookings', 'Refund Policy', 'How Payment Works']
    },
    {
        intent: 'services_list',
        keywords: ['services', 'what services', 'types of service', 'service types', 'what do you offer', 'offerings', 'service list', 'available services'],
        weight: 2,
        responses: [
            "🛠️ **Our Services**\n\n• 🔧 **Regular Maintenance** — Scheduled upkeep\n• 🛢️ **Oil Change** — Engine oil replacement\n• 🔲 **Tire Repair** — Flat tire, puncture, replacement\n• 🛑 **Brake Service** — Inspection and repair\n• ⚙️ **Engine Repair** — Diagnostics and fixes\n• 🔋 **Battery Service** — Check, jump-start, replacement\n• ❄️ **AC Service** — Cooling system repair\n• 🚨 **Emergency Breakdown** — 24/7 roadside assistance\n\nAll services performed by verified, experienced mechanics!",
        ],
        quickReplies: ['Check Pricing', 'Book a Service', 'Find a Mechanic']
    },
    {
        intent: 'review',
        keywords: ['review', 'rating', 'feedback', 'rate', 'stars', 'leave review', 'write review'],
        weight: 2,
        responses: [
            "⭐ **Leave a Review**\n\nAfter your service is completed:\n\n1. Go to **My Bookings**\n2. Find the completed booking\n3. Click **Leave Review**\n4. Rate the mechanic (1-5 stars) and write your feedback\n\nYour reviews help other customers find great mechanics! 🙏",
        ],
        quickReplies: ['My Bookings', 'Find a Mechanic', 'Contact Support']
    },
    {
        intent: 'thanks',
        keywords: ['thank', 'thanks', 'thank you', 'appreciate', 'great', 'awesome', 'helpful', 'nice', 'perfect', 'wonderful'],
        weight: 1,
        responses: [
            "You're welcome! 😊 Happy to help. Is there anything else I can assist you with?",
            "Glad I could help! 🙌 Let me know if you need anything else.",
            "Anytime! 😄 Feel free to ask if you have more questions!"
        ],
        quickReplies: ['Book a Service', 'Find a Mechanic', "That's all, bye!"]
    },
    {
        intent: 'goodbye',
        keywords: ['bye', 'goodbye', 'see you', 'later', 'exit', 'close', "that's all", 'done', 'nothing else'],
        weight: 1,
        responses: [
            "Goodbye! 👋 Have a great day! Feel free to chat anytime you need help.",
            "See you later! 🚗 Drive safe and come back whenever you need us!",
            "Bye! 😊 VehicleVerse is always here to help. Take care!"
        ],
        quickReplies: []
    },
    {
        intent: 'registration',
        keywords: ['register', 'sign up', 'create account', 'new account', 'join', 'signup', 'how to register'],
        weight: 2,
        responses: [
            "📝 **How to Register**\n\n1. Go to the **Registration** page\n2. Fill in your name, email, phone, and password\n3. Select your role (Customer)\n4. Select your district/location\n5. Click **Register** — you're all set!\n\nAfter registering, add your vehicles and start booking services!",
        ],
        quickReplies: ['Add a Vehicle', 'Book a Service', 'Find a Mechanic']
    },
    {
        intent: 'advance_payment',
        keywords: ['advance payment', 'advance', 'confirmation payment', 'confirmation fee', 'how much advance', 'minimum payment', 'upfront', 'deposit'],
        weight: 4,
        responses: [
            "💵 **Advance Payment Details**\n\n**Emergency Breakdown:**\n• Minimum advance: **₹1,500**\n• You can pay more if you'd like\n• Paid immediately when booking (before mechanic is assigned)\n• Methods: Credit/Debit Card or UPI\n\n**Regular Service:**\n• No payment at booking time\n• **₹1,000 confirmation fee** after a mechanic accepts\n• This confirms your commitment to the booking\n• Methods: Credit/Debit Card or UPI\n\n**What happens to the advance?**\n• It's applied toward the final bill\n• If final cost > advance → You pay the difference\n• If final cost < advance → Difference is refunded\n• If booking is cancelled → Full refund (for pending bookings)",
        ],
        quickReplies: ['How Payment Works', 'Refund Policy', 'Book a Service']
    },
    {
        intent: 'final_payment',
        keywords: ['final payment', 'final amount', 'remaining', 'balance', 'after service', 'confirm amount', 'mechanic charge', 'total cost', 'bill', 'final bill', 'confirm payment'],
        weight: 4,
        responses: [
            "🧾 **Final Payment Process**\n\nAfter the mechanic completes the work:\n\n1. **Mechanic sets final amount** — based on work performed\n2. **You get notified** — see the final amount in My Bookings\n3. **You choose:**\n   ✅ **Confirm** — Accept the amount\n   ❌ **Dispute** — Enter a different amount if you disagree\n4. **Settlement:**\n   • If confirmed and final > advance → Pay remaining via Card/UPI\n   • If confirmed and final < advance → Difference refunded\n   • If disputed → Admin reviews within 24-48 hours\n\n**Example:**\n• You paid ₹1,500 advance\n• Mechanic sets final amount: ₹2,200\n• You confirm → pay remaining ₹700\n\n💡 Always check the work done before confirming!",
        ],
        quickReplies: ['Refund Policy', 'Contact Support', 'My Bookings']
    }
];


// ═══════════════════════════════════════════════════════════
// MATCHING ENGINE
// ═══════════════════════════════════════════════════════════

function calculateScore(input, intent) {
    const normalizedInput = input.toLowerCase().trim();
    let score = 0;
    let matchCount = 0;

    for (const keyword of intent.keywords) {
        if (normalizedInput.includes(keyword.toLowerCase())) {
            const wordCount = keyword.split(' ').length;
            score += wordCount * intent.weight;
            matchCount++;
        }
    }

    if (matchCount > 1) score *= 1.5;
    return score;
}

function findBestIntent(userMessage) {
    if (!userMessage || !userMessage.trim()) return null;

    let bestIntent = null;
    let bestScore = 0;

    for (const intent of knowledgeBase) {
        const score = calculateScore(userMessage, intent);
        if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
        }
    }

    return bestScore >= 1 ? bestIntent : null;
}


// ═══════════════════════════════════════════════════════════
// DYNAMIC DATA FORMATTERS — format real API data for chat
// ═══════════════════════════════════════════════════════════

/**
 * Format a list of mechanics into a chatbot response
 */
function formatMechanicsResponse(mechanics) {
    if (!mechanics || mechanics.length === 0) {
        return {
            text: "🔍 **Available Mechanics**\n\nNo mechanics are currently available. Please check back later or try booking a service — our system will automatically find a mechanic for you!\n\n💡 You can still create a booking, and mechanics will be notified.",
            quickReplies: ['Book a Service', 'Working Hours', 'Contact Support']
        };
    }

    const availableMechanics = mechanics.filter(m => m.is_available);
    const totalCount = mechanics.length;
    const availableCount = availableMechanics.length;

    let text = `🔍 **Available Mechanics** (${availableCount} of ${totalCount} online)\n\n`;

    const displayList = availableMechanics.slice(0, 5); // Show max 5
    displayList.forEach((m, i) => {
        const name = m.full_name || m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Mechanic';
        const rating = m.average_rating ? `⭐ ${Number(m.average_rating).toFixed(1)}` : '⭐ New';
        const district = m.district || '';
        const specs = m.specialization || m.specializations || '';

        text += `**${i + 1}. ${name}** — ${rating}`;
        if (district) text += ` | 📍 ${district}`;
        if (specs) text += `\n   🔧 ${specs}`;
        text += `\n`;
        if (i < displayList.length - 1) text += '\n';
    });

    if (availableMechanics.length > 5) {
        text += `\n...and ${availableMechanics.length - 5} more! Visit **Find Mechanics** page to see all.`;
    }

    text += `\n\n💡 Visit the **Find Mechanics** page from the sidebar to view full profiles, reviews, and book directly!`;

    return {
        text,
        quickReplies: ['Book a Service', 'How Payment Works', 'Check Pricing']
    };
}

/**
 * Format a list of customer bookings into a chatbot response
 */
function formatBookingsResponse(bookings) {
    if (!bookings || bookings.length === 0) {
        return {
            text: "📋 **Your Bookings**\n\nYou don't have any bookings yet! Would you like to book a service?\n\n💡 You can book a **Regular Service** or an **Emergency Breakdown** from your dashboard.",
            quickReplies: ['Book a Service', 'Emergency Breakdown', 'Find a Mechanic']
        };
    }

    const statusIcons = {
        'PENDING': '🟡',
        'ASSIGNED': '🔵',
        'IN_PROGRESS': '🟠',
        'COMPLETED': '✅',
        'CANCELLED': '🔴',
        'NO_MECHANIC': '⚪',
        'REFUNDED': '💸'
    };

    let text = `📋 **Your Bookings** (${bookings.length} total)\n\n`;

    // Show most recent 5 bookings
    const recentBookings = bookings.slice(0, 5);
    recentBookings.forEach((b, i) => {
        const icon = statusIcons[b.booking_status] || '⚪';
        const status = b.booking_status?.replace(/_/g, ' ') || 'Unknown';
        const type = b.service_type === 'BREAKDOWN' ? '🚨 Emergency' : '🔧 Regular';
        const vehicle = b.vehicle?.vehicle_name || b.vehicle?.registration_no || 'Vehicle';
        const date = b.created_at ? new Date(b.created_at).toLocaleDateString() : '';

        text += `${icon} **Booking #${b.booking_id}** — ${status}\n`;
        text += `   ${type} | ${vehicle}`;
        if (b.service_category) text += ` | ${b.service_category}`;
        text += `\n`;
        if (date) text += `   📅 ${date}`;

        // Payment info
        if (b.payment) {
            const advance = b.payment.advance_amount ? `₹${b.payment.advance_amount}` : null;
            const advStatus = b.payment.advance_status;
            const finalAmt = b.payment.final_amount ? `₹${b.payment.final_amount}` : null;

            if (advance && advStatus === 'PAID') {
                text += ` | 💰 Advance: ${advance} (Paid)`;
            } else if (advance && advStatus === 'PENDING') {
                text += ` | 💰 Advance: ${advance} (**Payment Needed!**)`;
            }
            if (finalAmt) {
                text += `\n   🧾 Final Amount: ${finalAmt} (${b.payment.final_status})`;
            }
        }

        // Mechanic info
        if (b.mechanic) {
            const mechName = b.mechanic.full_name || `${b.mechanic.first_name || ''} ${b.mechanic.last_name || ''}`.trim();
            if (mechName) text += `\n   👨‍🔧 Mechanic: ${mechName}`;
        }

        text += '\n';
        if (i < recentBookings.length - 1) text += '\n';
    });

    if (bookings.length > 5) {
        text += `\n...and ${bookings.length - 5} more. Visit **My Bookings** for the full list.`;
    }

    // Add action hints based on statuses
    const pendingPayments = bookings.filter(b =>
        b.booking_status === 'ASSIGNED' &&
        b.payment?.advance_status === 'PENDING'
    );
    if (pendingPayments.length > 0) {
        text += `\n\n⚠️ **Action Required:** You have **${pendingPayments.length}** booking(s) awaiting payment! Go to **My Bookings** to pay.`;
    }

    text += `\n\n💡 Go to **My Bookings** from the sidebar for full details, payments, reviews, and more.`;

    return {
        text,
        quickReplies: ['How Payment Works', 'Cancel Booking', 'Contact Support']
    };
}


// ═══════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════

/**
 * Get the best response for user input.
 * Returns { text, quickReplies, dynamic?, dynamicType? }
 */
function getResponse(userMessage) {
    if (!userMessage || !userMessage.trim()) {
        return {
            text: "I didn't catch that. Could you please type your question?",
            quickReplies: ['Book a Service', 'Emergency Breakdown', 'Find a Mechanic', 'Help']
        };
    }

    const intent = findBestIntent(userMessage);

    if (intent) {
        // If intent is dynamic, signal the widget to fetch data
        if (intent.dynamic) {
            return {
                text: intent.responses[0],
                quickReplies: intent.quickReplies || [],
                dynamic: true,
                dynamicType: intent.dynamicType
            };
        }

        const randomIndex = Math.floor(Math.random() * intent.responses.length);
        return {
            text: intent.responses[randomIndex],
            quickReplies: intent.quickReplies || []
        };
    }

    // Fallback
    const fallbacks = [
        "I'm not sure I understood that. Could you rephrase? You can ask me about booking services, finding mechanics, pricing, payment procedures, or emergency assistance! 🤔",
        "Hmm, I didn't quite get that. Try asking about services, bookings, payment process, or pricing! I'm here to help. 😊",
        "I'm still learning! Try asking me about booking a service, emergency breakdown, how payment works, finding a mechanic, or checking your booking status. 🚗"
    ];

    return {
        text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        quickReplies: ['Book a Service', 'How Payment Works', 'Find a Mechanic', 'Check Pricing', 'My Bookings']
    };
}

/**
 * Get the welcome message shown when chat first opens
 */
function getWelcomeMessage() {
    return {
        text: "Hello! 👋 I'm the **VehicleVerse Assistant**. I can help you with:\n\n• 🔧 Booking services\n• 🚨 Emergency breakdown\n• 🔍 Finding available mechanics\n• 💰 Pricing & payment procedures\n• 📋 Your booking status\n• 💳 How payments & refunds work\n• ❓ Any other questions\n\nHow can I assist you today?",
        quickReplies: ['Book a Service', 'How Payment Works', 'Find a Mechanic', 'Check Pricing', 'My Bookings']
    };
}

/**
 * Random typing delay between 400ms and 1200ms
 */
function getTypingDelay() {
    return Math.floor(Math.random() * 800) + 400;
}

export {
    getResponse,
    getWelcomeMessage,
    getTypingDelay,
    formatMechanicsResponse,
    formatBookingsResponse
};
