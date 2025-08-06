### Is it feature that the good cards aren't shown anymore?

- Yes, that is a feature. It's the core principle of the spaced repetition algorithm we've implemented based on the PRD.
Here's the thinking behind it:
The Goal is Efficiency: The system is designed to show you a card only when you are on the verge of forgetting it. Showing you something you already know well ("Good") is an inefficient use of your study time.
How it Works: When you mark a card as "Good," the algorithm calculates the next optimal time to show it to you.
If you're just starting to learn a song, it might schedule it for review in the "Again" deck a few days from now.
If you've marked it as "Good" several times, it might schedule it for review in the "Good" deck a month or more in the future.
The card isn't gone forever. It's just been filed away and will only reappear in the "Again" or "Good" decks when its nextDue date arrives. This ensures that your review sessions are always focused on the material you're actively learning or are about to forget.
So, seeing the "Good" pile stay at zero (or not seeing those cards in the "Again" pile right away) is a sign that the system is working exactly as intended. It's saving you from reviewing things you've already mastered.