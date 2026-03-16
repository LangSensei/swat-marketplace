---
name: xiaohongshu
version: "1.1.0"
description: Xiaohongshu (小红书) browser automation skill. Use when browsing/searching content, extracting post data, or interacting with the platform via playwright. Requires pre-authenticated storage state.
dependencies:
  mcps: [playwright]
prereq: references/SETUP.md
---

# Xiaohongshu Skill

## Storage State

This skill requires a pre-authenticated browser state at `~/.swat/playwright/storage-state.json`. If missing or expired, fail the operation — debrief will notify the user to re-authenticate via OpenClaw.

Use with playwright MCP:
```
--storage-state ~/.swat/playwright/storage-state.json
```

## Common Operations

### Search Posts
Navigate to `https://www.xiaohongshu.com/search_result?keyword=<query>`, snapshot to extract titles, authors, likes.

### View Post Detail
Navigate to `https://www.xiaohongshu.com/explore/<post-id>`, snapshot for content, images, comments.

### Browse User Profile
Navigate to `https://www.xiaohongshu.com/user/profile/<user-id>`, snapshot for bio, followers, posts.

### Explore Trending
Navigate to `https://www.xiaohongshu.com/explore`, snapshot for trending content.

## Notes
- Storage state expires after days/weeks — fail and debrief if auth errors occur
- Add delays between requests to avoid rate limiting
- All content is Chinese — requires fonts-noto-cjk on the system
