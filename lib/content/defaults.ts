/**
 * Built-in content. It seeds the database (`npm run db:seed:content`) and is the fallback if a row
 * is missing, so a page can never be blank. Everything here is editable from Admin → Content.
 *
 * Placeholders replaced at render time: {{storeName}} {{standardFee}} {{expressFee}}
 * {{freeThreshold}} {{supportEmail}} {{supportPhone}}
 */
export interface DefaultPage {
  slug: string;
  title: string;
  description: string;
  body: string;
}

export const DEFAULT_PAGES: DefaultPage[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: "What data {{storeName}} collects, how it is used and stored, and your rights.",
    body: `This policy explains how {{storeName}} collects, uses and protects your personal information.

## Data we collect

When you place an order we collect your name, email, phone number, delivery address and the items you bought. If you pay by InstaPay or mobile wallet we also keep the number you sent from, the transfer reference and, if you upload one, a screenshot of the transfer. If you write to us or subscribe to the newsletter we keep your message and email address. Our servers also log technical data such as IP address and browser type to keep the site secure and prevent abuse.

## Cookies and local storage

We do not use advertising or tracking cookies. Your browser stores your shopping bag, wishlist and light/dark preference on your own device so they are remembered between visits. You can clear them at any time in your browser settings; the bag and wishlist will then be empty.

## How we use your data

We use your information to process and deliver orders, verify payments, answer your messages, send the newsletter if you subscribed, prevent fraud and improve our service. We do not sell your personal data.

## Who handles your data

Your data is stored with our infrastructure providers (hosting and database services), who process it only to run the store. We share your name, phone number and address with the courier that delivers your order. We do not share your data with anyone else except where the law requires it.

## Retention

We keep order records for as long as needed for accounting, returns and legal obligations. Contact messages and payment screenshots are deleted when they are no longer needed. You can unsubscribe from the newsletter at any time.

## Your rights

You may request access to, correction of, or deletion of your personal data at any time by contacting us at {{supportEmail}}. We will respond in accordance with applicable law.`,
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    description: "The terms that apply to orders, payments and use of the {{storeName}} website.",
    body: `By using this website and placing an order you agree to these terms.

## Orders

Orders placed through {{storeName}} are an offer to purchase. We reserve the right to refuse or cancel any order, including after it has been placed, for example when an item is unavailable or a transfer payment cannot be verified.

## Prices and payments

Prices are listed in Egyptian pounds (EGP). You can pay cash on delivery, or by InstaPay or mobile wallet transfer to the account shown at checkout. Orders paid by transfer are prepared once we confirm that the full amount has been received; if we cannot verify a transfer we may contact you or cancel the order. Ownership passes once payment is received in full.

## Shipping and returns

Delivery is described on our Shipping page and returns on our Returns page; both form part of these terms.

## Intellectual property

All content, including logos, photography and designs, is the property of {{storeName}} or its licensors and may not be reproduced without written permission.

## Liability

To the maximum extent permitted by law, {{storeName}} is not liable for indirect or consequential damages arising from the use of this website or its products.

## Governing law

These terms are governed by the laws of the Arab Republic of Egypt.`,
  },
  {
    slug: "shipping",
    title: "Shipping & Delivery",
    description: "{{storeName}} delivery areas, times and costs across Egypt.",
    body: `We deliver across Egypt with care. Standard shipping is free on orders of {{freeThreshold}} or more.

## Delivery regions and times

| Region | Time | Cost |
| --- | --- | --- |
| Cairo & Giza | 1–2 business days | {{standardFee}} |
| Alexandria | 2–3 business days | {{standardFee}} |
| Other governorates | 3–4 business days | {{standardFee}} |
| Orders of {{freeThreshold}} or more | 2–4 business days | Free |

## Shipping cost

A flat rate of {{standardFee}} applies to standard delivery. Orders of {{freeThreshold}} or more ship free. Express delivery (next day) is available at checkout for {{expressFee}}.

## Processing

Orders are processed within 24 hours. Orders paid by InstaPay or mobile wallet are prepared once we confirm your transfer.

## Tracking your order

Open the **Track Order** page and enter your order number and the email you used at checkout to see your order's status at any time.`,
  },
  {
    slug: "returns",
    title: "Returns & Exchanges",
    description: "{{storeName}} exchange policy, refund process and return conditions.",
    body: `We want you to love your {{storeName}} pieces. If something isn't right, we make returns and exchanges simple.

## Exchange policy

Exchanges are accepted within 14 days of delivery for a different size or color, subject to availability. Contact us at {{supportEmail}} to start an exchange.

## Refund process

Once we receive and inspect your return, refunds are issued within 5–7 business days, through the same method you paid with or by InstaPay / wallet transfer.

## Conditions

- Items must be unworn and unwashed.
- Original tags must be attached.
- Items must be in their original packaging.
- Final sale items are not eligible for return.`,
  },
];

export interface DefaultFaq {
  question: string;
  answer: string;
}

export const DEFAULT_FAQ: DefaultFaq[] = [
  { question: "How long does delivery take?", answer: "Orders are processed within 24 hours and delivered within 2–4 business days across Egypt. Express delivery is available at checkout." },
  { question: "How do I track my order?", answer: "Open the Track Order page and enter your order number and the email you used at checkout. You will see the current status of your order, and you can upload a payment screenshot there if you paid by transfer." },
  { question: "What is your return policy?", answer: "Returns and exchanges are accepted within 14 days, provided the item remains unworn and in its original condition with tags attached." },
  { question: "When will I receive my refund?", answer: "Refunds are processed within 5–7 business days after we receive and inspect your return. We refund through the same method you paid with, or by InstaPay / wallet transfer." },
  { question: "Can I change or cancel my order?", answer: "Order changes are possible within 2 hours of placing the order. Contact us as soon as possible and we will do our best to help." },
  { question: "How do I find my size?", answer: "Each product page includes a Size Guide with measurements in centimeters. If you are between sizes, we recommend sizing up for a relaxed fit." },
  { question: "What payment methods do you accept?", answer: "We accept Cash On Delivery, InstaPay and mobile wallet transfers (such as Vodafone Cash) within Egypt. The options currently available are shown at checkout." },
  { question: "Is my payment information secure?", answer: "Yes. The whole site is served over a secure HTTPS connection and we never ask for card details. Transfers go straight from your bank app or wallet to our account, and your transfer screenshot is stored privately and only visible to our team." },
  { question: "How should I care for my {{storeName}} pieces?", answer: "Machine wash cold with like colors, tumble dry low, and iron on low heat. Avoid bleach to keep fabrics looking their best." },
];
