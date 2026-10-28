---
title: "How do I invite team members to my sbomify workspace?"
description: "Invite people to your sbomify workspace, pick the right role (owner, admin, member, or operator), revoke pending invitations, and remove members."
answer: "Open Settings, then the Members tab. Choose Invite member, enter the email address, pick a role and click Invite to workspace. sbomify emails the invite, and it waits under Pending invitations until it is accepted. To remove someone, open the menu on their row and choose Remove member. To change a role, remove the person and invite them again."
tldr: "The Members tab in Settings lists everyone in the workspace with their role. Owners and admins run the workspace, members do the day-to-day work, and operators read everything and triage vulnerabilities but change nothing else."
weight: 82
keywords: [invite team members, workspace members, sbomify roles, owner, admin, member, operator, guest, remove member, revoke invitation]
url: /faq/how-do-i-invite-team-members/
---

## Walkthrough

{{< video-embed-native video_url="https://marketing-assets.sbomify.com/screencasts/team_members.webm" title="How to manage team members in sbomify" description="Narrated screencast: review workspace roles, invite a member as an operator, revoke a pending invitation, and remove a member from the Members tab in Settings." upload_date="2026-10-28T00:00:00Z" >}}

## Inviting someone

1. Open **Settings** and go to the **Members** tab. It lists everyone in the workspace, with their role
2. Choose **Invite member**
3. Enter their email address and pick a **Role**. Each role is explained below the list
4. Click **Invite to workspace**

sbomify emails the invite. Until it is accepted, it waits under **Pending invitations**. Changed your mind? Revoke the invitation, and the link stops working.

## Which role to give

Not sure? Open **What can each role do?** on the Members tab. In short:

| Role         | What they can do                                                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owner**    | Full control. Everything an admin can do, plus deleting the workspace, inviting owners, and removing other owners.                                                                                               |
| **Admin**    | Runs the workspace day to day: products, components, and releases, uploads, workspace settings, the Trust Center, integrations, members, and billing. Cannot invite or remove an owner, or delete the workspace. |
| **Member**   | Day-to-day work: create and edit products, components, and releases, upload SBOMs and documents, and triage vulnerabilities. Cannot delete anything, change what is public, or reach workspace settings.         |
| **Operator** | Reads everything in the workspace and triages vulnerabilities. Cannot create or edit anything else, upload artifacts, or reach workspace settings.                                                               |

Guests are different: they get external access through your Trust Center when you approve an access request, rather than being invited here. See [How do I manage Trust Center access requests?](/faq/how-do-i-manage-trust-center-access-requests/).

## Removing someone

To take someone's access away, open the menu on their row and choose **Remove member**, then confirm. Their access ends immediately.

There is no role switch on this tab. To give someone a different role, remove them and invite them again.

## Further reading

- [How do I create an API token?](/faq/how-do-i-create-an-api-token/) - tokens are personal to each member
- [How do I triage vulnerabilities?](/faq/how-do-i-triage-vulnerabilities/) - the work operators are there for
- [How do I delete a workspace?](/faq/how-do-i-delete-a-workspace/) - owner only
