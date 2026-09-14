# Privacy Notice

**Last updated:** 14 September 2026

This notice explains what the Barnsley Offline Business Directory does and does not
do with data. It applies to the hosted copy at
<https://lin4cre.github.io/Barnsley-Web-Builder/> and to any self-hosted instance.

## Summary

- **Your outreach data never leaves your device.** Outreach stage and private notes
  are stored in your browser's local storage. There is no account, no sign-in, and
  no server-side database.
- **No analytics, no advertising, no third-party trackers.**
- **No third-party requests at all** in normal use: fonts are self-hosted and every
  asset is served from the same origin.
- **AI features are opt-in and use your own key.** They run only when you self-host
  with a `GEMINI_API_KEY`.

## What is stored, and where

| Data | Where it lives | How long |
| --- | --- | --- |
| Outreach stage per business | Your browser (`localStorage`, key `barnsley:v1:statuses`) | Until you clear site data |
| Private notes | Your browser (`barnsley:v1:notes:*`) | Until you clear site data |
| Businesses you add or import | Your browser (`barnsley:v1:custom-businesses`) | Until you clear site data |
| Preferred view (cards/table) | Your browser (`barnsley:v1:view-mode`) | Until you clear site data |

None of this is transmitted. Clearing your browser data for this site erases it
permanently — **use Export CSV first if you want to keep it.**

## When you run the server yourself

If you self-host and set `GEMINI_API_KEY`, then when you press a generate button the
name, sector, location, phone number, rating and review count of the business you
selected are sent to the Google Gemini API to produce the text. That is the only
outbound transmission the application makes, and it happens only on your explicit
request.

Google's handling of that data is governed by Google's own terms and privacy policy.
Do not send data you are not permitted to share.

## The business data itself

Directory entries are compiled from publicly available information — public business
listings, published addresses and phone numbers, and publicly visible customer
reviews. They are working research notes.

If you are a business listed here and would like the entry corrected or removed,
open an issue or contact the repository owner and it will be actioned.

## Your rights (UK GDPR)

Because the application stores data only on your own device and the operator never
receives it, the operator holds no personal data about you to access, correct, or
erase. If that changes — for example if server-side accounts or analytics are added
— this notice will be updated before those features ship.

## Cookies

None. The application uses local storage, which is device-side state, not a cookie,
and is not sent with requests.

## Contact

Open an issue at <https://github.com/LIN4CRE/Barnsley-Web-Builder/issues>.
