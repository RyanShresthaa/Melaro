# Melaro — Business Questions

## 1. Revenue model

*If Melaro were a real product launching in Kathmandu, what do you think its most realistic revenue model would be, and why? Consider who has the strongest incentive to pay.*

Most of the events I'd be putting on Melaro would be free-of-charge or low-cost community events - run clubs, gigs, meetups, etc. and taking a cut from tickets wouldn't pay off until Melaro has enough traffic. 
The one who has to fill the room is the organiser or venue. I would begin by paid placement for those who wish to be on the home feed or in a category, like a cafe pays to be on a map. Keep joining free. Later if paid events become common, charge a small booking fee and rather than making it the initial revenue model.

## 2. Cost drivers at early scale

*What would be the two or three biggest cost drivers for running Melaro at early scale — say, 5,000 monthly active users in Kathmandu — and how would you think about keeping those costs manageable?*

The biggest cost drivers at 5,000 MAU might be storing and serving event cover images, the chat infrastructure, and moderation.

At that size I'd keep the chat simple; store the messages, but not features like online status or more complicated realtime features until they are required at the time. I would use a CDN for event images, so they load quickly without consuming too much storage or bandwidth. I would also restrict the push notifications to useful things such as events that a user has joined. First of all, I'd look into a decent reporting and moderation system over spending too much money on AI moderation this early on.

## 3. One feature to push back on, one that's missing

*As the engineer who built this, what is one feature you would push back on adding in the next version, and one feature you think is obviously missing? Explain your reasoning for both.*

**Push back on:** An entire follow/follower system. Melaro is not just a social media app, it's largely about what is going on in the week! If we were to build followers lists, feeds and notifications that would take a considerable amount of time without actually contributing to the main goal of the app.

**Missing:** Greater control on who is allowed to attend private events. Currently, a private event can be joined by any member. I'd rather make private events request-to-join, where the host approves attendees, and the host approves. or option rather than more social functions for Kathmandu Meetups.

## 4. Expanding beyond Kathmandu

*If Melaro wanted to expand beyond Kathmandu to other cities in Nepal, what changes — technical or otherwise — would that require, and what would you prioritise first?*

In theory, moving to other cities would entail simply adding a city field to events and users; and making the Home and Search pages display events by city. This aspect is fairly straightforward.
The bigger problem is launching a new city with an empty feed when starting a new city such as Pokhara or Butwal. I would first get some local host groups like a run club, venue or regular event, already listed before launching the city. So if I had to prioritize it in the app, I would do it first but the more important one would be to get local hosts and events, not making major database changes.