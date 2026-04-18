# Changelog

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
