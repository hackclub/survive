# Survive
A website for a really cool ysws, where you code projects that are either offline or outdoors themed, and win camping gear.

build something that survives when:
- the wifi dies
- the servers explode
- your ISP decides no more internet

or 

Build a game or project that is outdoors themed:
- A sandbox game
- A camping companion app
- A survival guide
- A stargazing or trail mapping tool

## Screenshots
<img width="1470" height="803" alt="Screenshot 2026-08-24 at 8 05 07 am" src="https://github.com/user-attachments/assets/b302cfc9-8e46-4567-813f-133893835fdc" />
![Uploading Screenshot 2026-08-24 at 8.05.19 am.png…]()




## Slack notifications

Survive can send private DMs through the existing Survive Slack bot. Set `SLACK_BOT_TOKEN` on the Rails web/worker service to the same bot token used by the bot. The Slack app needs the `chat:write` and `im:write` bot token scopes; reinstall the app if those scopes are newly added.

The website reuses each account's `slack_id` from Hack Club authentication. No separate account linking is needed.

Notifications are sent for:
- Project submissions (confirmation to the maker and a review-queue DM to reviewers).
- Review decisions and final-review outcomes (to the maker).
- Reward orders approved for fulfilment (to the maker and fulfilment team), then fulfilled rewards (to the participant).
- Draft or returned projects inactive for 14 days (a reminder at most once per week).

DMs are queued through Active Job and deduplicated by event, so retries do not normally send duplicates. The inactive-project check runs daily in production.
