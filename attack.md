Short answer: the “omnibox” is the browser’s combined address/search bar (Chrome’s term). In Atlas, it doubles as both the URL bar and the place where you type prompts to the agent.

What the attack is:
- Design choice: Atlas treats omnibox input as trusted “user intent.” If it looks like a URL (starts with https://), it navigates. If it’s plain text, it becomes a prompt to the agent with higher trust and fewer checks.
- The page (low-trust render process) can change the visible URL path via history APIs and display instructions. It then persuades the agent/user to remove the “https://” prefix from the omnibox.
- Once “https://” is removed, the string is no longer a URL; Atlas interprets it as a prompt coming from the omnibox (i.e., from the “user”), so it executes those instructions with elevated trust. That bypasses the safety checks applied to instructions that originate inside the page.
- Net effect: a malicious site gets the agent to run commands it shouldn’t, because the trust boundary was crossed by changing how the same text is routed (URL → prompt) without tracking provenance.

Why it works (the core bug):
- It’s a confused-deputy/provenance bug plus prompt injection.
- Trust in Atlas is tied to the input channel (omnibox = user) instead of the true source of the instruction. By mutating the scheme (removing https://), the attacker turns untrusted page-supplied text into “trusted” omnibox prompt text.

Impact:
- Unwanted actions (e.g., searches, tool calls, navigation, or other privileged operations the agent can perform) that the user didn’t explicitly intend.
- Continues as long as the malicious text persists in the omnibox, because the agent keeps treating it as user input.

Better fixes (defense-in-depth):
- Separate channels: don’t overload the omnibox. Have a dedicated prompt box distinct from the address bar, or require an explicit mode switch.
- Preserve provenance: attach a “source principal” to all instructions. Anything derived from a page stays page-origin and can’t inherit omnibox privileges, even if moved/copied there.
- No auto-prefill: never insert or transform untrusted page data into the omnibox. Block or warn on operations that change a URL into free text.
- Explicit previews: before executing, show the exact command that will run, with a clear “this came from page X” indicator, and require confirmation.
- Safer routing rules: commands must be explicitly prefixed (e.g., “cmd: …”). Heuristics like “starts with https:// → navigate else → prompt” are fragile.
- Policy checks by capability, not channel: certain actions always require consent regardless of source (opening tabs, downloads, external tool calls).

In short: the omnibox is the address bar. The attack exploits UI/channel confusion so page-controlled text becomes “user” commands. Fix by separating modes and tracking provenance so text can’t gain trust just by changing how it’s entered.