# Changelog

## 1.4.0 (2026-04-19)

- **feat:** add promotions column to report table — summarize booking coupons from 订房优惠
- **feat:** add per-hotel detail section with full coupon info and room type breakdown
- **feat:** leverage ctrip-hotel-price v1.2.0 detail page data (promotions + rooms)
- Updated report template with 优惠券 column and detail sections

## 1.3.0 (2026-04-19)

- Add optional email delivery via qq-email skill — send report.html to specified recipient
- Add qq-email to skill dependencies
- Email delivery is best-effort — failure does not block operation

## 1.2.0 (2026-04-18)

- Handle `sold_out` status in report table — show "售罄" with reference price if available
- Add 售罄 count to summary line
- Sort order: priced hotels (ascending) → sold-out → failed

## 1.1.0 (2026-04-18)

- Add default date handling: checkin/checkout defaults to today→tomorrow when omitted
- Add NODE_PATH portability note for environments where `npm root -g` returns incorrect path
- Make comparison table mandatory — all queried hotels must appear regardless of success/failure
- Add 备注 column to table for failure status and notes
- Add mandatory summary line after table with success/failure counts and lowest price
- Failed hotels now show "—" for price columns and "查询失败" in 备注

## 1.0.0 (2026-04-18)

- Initial release
- Batch hotel price comparison via ctrip-hotel-price skill
- Sequential querying with rate limiting (5-10s delay)
- Chinese-language comparison report with price, original price, and discount
- Auth verification before query execution
- Graceful failure handling for individual hotel queries
