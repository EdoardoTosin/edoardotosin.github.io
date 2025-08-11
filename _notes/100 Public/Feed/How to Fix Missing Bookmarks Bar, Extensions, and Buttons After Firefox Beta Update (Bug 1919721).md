---
title: How to Fix Missing Bookmarks Bar, Extensions, and Buttons After Firefox Beta Update (Bug 1919721)
description: Learn how to resolve the issue caused by bug 1919721 where the bookmarks bar, toolbar buttons, and pinned extensions disappear after updating Firefox Beta. Mozilla has updated Firefox to fix this in version 132.0b2; however, users must manually adjust their preferences to restore these features.
feed: show
date: 2024-10-02 21:30:00 +0200
last_modified_at: 2024-10-03 08:40:00 +0200
lang: en
ogimg: https://raw.githubusercontent.com/EdoardoTosin/web-assets/refs/heads/main/Notes/100%20Public/Feed/How%20to%20Fix%20Missing%20Bookmarks%20Bar%2C%20Extensions%2C%20and%20Buttons%20After%20Firefox%20Beta%20Update%20(Bug%201919721)/firefox-beta-bug-1919721.jpg
tags: ["firefox", "toolbar", "bug", "fix"]
keywords: ["firefox bookmarks missing", "firefox toolbar disappeared", "firefox beta bug", "firefox ui customization", "browser bookmarks bar", "firefox extensions missing", "mozilla bug fix"]
---

Firefox users with Beta and Developer Edition versions may encounter the disappearance of the bookmarks bar, toolbar buttons, and pinned extensions[^1][^2] due to [bug 1919721](https://bugzilla.mozilla.org/show_bug.cgi?id=1919721). This issue arises from a flawed logical condition that affects toolbar management in Firefox.

{% include Image.html src=page.ogimg title="[Bug 1919721](https://bugzilla.mozilla.org/show_bug.cgi?id=1919721) on Firefox Beta 132.0b1" %}

Mozilla has addressed this bug in version 132.0b2.[^3][^4] However, affected users must manually adjust their preferences to restore these features. The following steps will help you resolve this issue:

---

:warning: ***Make a copy of your profile folder before making any changes. This precaution ensures that you can revert any modifications if issues arise.*** :warning:

[Back up and restore information in Firefox profiles](https://support.mozilla.org/kb/back-and-restore-information-firefox-profiles)

## Steps to Fix the Issue

### Method 1: Delete toolbar customization line (Easiest)

1. Open Firefox and type `about:profiles` in the address bar, then press **Enter**. You may see a warning; confirm your action to proceed.
2. Locate the profile that is set as "Default Profile".
3. Click on "Open Folder" next to where it shows "Root Directory".
4. In the opened directory, open `prefs.js` with a text editor and delete the entire line that starts with:
   ```js
   user_pref("browser.uiCustomization.state"
   ```

### Method 2: Restore basic toolbar elements

1. Type `about:config` in the address bar and press **Enter**. You may see a warning; confirm your action to proceed.
2. Search for the preference `browser.uiCustomization.state`.
3. Copy the JSON string into a text editor for easier modification.
4. Locate and modify the first occurrence of `"PersonalToolbar":[]` in the JSON, replacing it with:
   ```json
   "PersonalToolbar":["personal-bookmarks"]
   ```
5. Identify and replace the contents of `"TabsToolbar":[]` with:
   ```json
   "TabsToolbar":["firefox-view-button", "tabbrowser-tabs", "new-tab-button", "alltabs-button"]
   ```
6. Copy the revised JSON string back into the `browser.uiCustomization.state` field in `about:config`.
7. Click the check button to save your changes, then restart Firefox to apply these modifications.

### Rearrange Icons or Restore Defaults

1. Right-click on any blank space within your toolbar and select **"Customize Toolbar..."** from the context menu, or navigate to **View > Toolbars > Customize Toolbar...** via the main menu.
2. You can either restore default configurations or manually drag and drop icons to rearrange them as per your preference.

For more details check out [Customize Firefox controls, buttons and toolbars](https://support.mozilla.org/kb/customize-firefox-controls-buttons-and-toolbars).

---

By following these steps, you should be able to effectively restore and customize your Firefox Beta toolbar settings without encountering the bug-induced issue again. If issues persist after trying these methods, consider reaching out to Mozilla support for further assistance.

[^1]: [update bug in Firefox 132.0beta "Bookmarks Toolbar... - Mozilla Connect](https://connect.mozilla.org/t5/discussions/update-bug-in-firefox-132-0beta-quot-bookmarks-toolbar-quot-and/td-p/72590). Mozilla.

[^2]: [Users of Firefox Beta / Developer Edition 132, anybody else got messed up toolbar? : r/firefox](https://www.reddit.com/r/firefox/comments/1ftrm12/users_of_firefox_beta_developer_edition_132/). Reddit.

[^3]: [mozilla-beta: pushlog](https://hg.mozilla.org/releases/mozilla-beta/pushloghtml?fromchange=FIREFOX_132_0b1_RELEASE&tochange=FIREFOX_132_0b2_RELEASE). Mozilla.

[^4]: [mozilla-beta: changeset 832927:2f1eeae41cad2f7e2d4cd4f6f80b2cff17318745](https://hg.mozilla.org/releases/mozilla-beta/rev/2f1eeae41cad). Mozilla.
