# Admin Coach Tours - Educator Guide

A guide for creating effective step-by-step tutorials in the WordPress admin.

## Quick Start

1. Go to **Coach Tours** in the WordPress admin menu
2. Click **Add New Tour**
3. Give your tour a title and configure its settings
4. Use the **Element Picker** to select target elements for each step
5. Save and test your tour

---

## Understanding Completion Types

The **completion type** determines when a step advances to the next one. Choose the right type based on what you're teaching.

### `clickTarget` - Click on Element

**Use when:** You want users to click a button, link, or menu item.

**Example:** "Click the Publish button"

**Behavior:** Advances immediately when the user clicks the target element.

**⚠️ Warning:** Don't use this for input fields where users need to type! The click to focus the field will advance the step.

---

### `manual` - User Clicks Next

**Use when:** 
- Users need to type content (titles, text, etc.)
- You want to give users time to read/explore
- The step is informational

**Example:** "Enter a page title, then click Next"

**Behavior:** User must click the "Next" button in the coach panel to advance.

**✅ Recommended for:** Input fields, textareas, any content entry.

---

### `domValueChanged` - Wait for Content

**Use when:** You want to auto-advance after the user types something.

**Example:** "Type your page title" (advances after content is entered)

**Behavior:** Monitors the element for value changes. Advances when content is detected.

**Options:**
- `expectedValue` - Wait for specific text
- `attributeName` - Watch a specific attribute instead of content

---

### `wpData` - WordPress Data Store Change

**Use when:** You want to react to WordPress internal state changes.

**Example:** "Select a category" (advances when selection is made in store)

**Behavior:** Subscribes to `@wordpress/data` store and advances when condition is met.

**Options:**
- `store` - Store name (e.g., `core/editor`)
- `selector` - Selector function name
- `expected` - Expected value

---

## Preconditions

Preconditions set up the UI state before showing a step.

### `insertBlock` - Insert a Block

**Use when:** Your step targets a block that may not exist (e.g., on a new page).

```json
{
  "type": "insertBlock",
  "params": {
    "blockName": "core/paragraph",
    "markerId": "my-block"
  }
}
```

Then use locator: `wpBlock:inserted:my-block`

**Navigation behavior:**
- When moving **backward**, the inserted block is deselected
- When returning **forward** to the step, the previously inserted block is reused (not a new one inserted)
- This prevents duplicate blocks from being created when navigating back and forth

**Available block names:**
- `core/paragraph`
- `core/heading`
- `core/image`
- `core/list`
- etc.

---

### `ensureSidebarOpen` / `ensureSidebarClosed`

**Use when:** Step requires sidebar to be in specific state.

```json
{
  "type": "ensureSidebarOpen",
  "params": {
    "sidebar": "edit-post/document"
  }
}
```

Sidebar options:
- `edit-post/document` - Post/Page settings
- `edit-post/block` - Block settings

---

### `selectSidebarTab`

**Use when:** Step targets something in a specific sidebar tab.

```json
{
  "type": "selectSidebarTab",
  "params": {
    "tab": "document"
  }
}
```

---

### `openInserter` / `closeInserter`

**Use when:** Step involves the block inserter.

---

## Locator Types

Locators tell the tour how to find the target element. Multiple locators provide fallbacks.

### `wpBlock` - WordPress Block (Recommended for blocks)

Uses WordPress data layer - most reliable for blocks.

**Values:**
- `first` - First block in editor
- `last` - Last block
- `selected` - Currently selected block
- `type:core/paragraph` - First paragraph block
- `type:core/heading:1` - Second heading block (0-indexed)
- `inserted:markerId` - Block created by `insertBlock` precondition

---

### `role` - ARIA Role + Name

**Format:** `role:accessibleName`

**Examples:**
- `textbox:Add title` - Title field
- `button:Publish` - Publish button
- `checkbox:Allow comments` - Checkbox by label

---

### `ariaLabel` - Aria Label

**Example:** `Add title`

Finds elements with `aria-label="Add title"`.

---

### `css` - CSS Selector

**Example:** `.editor-post-title__input`

Standard CSS selector. Less reliable as class names can change.

---

### `dataAttribute` - Data Attributes

**Format:** `attributeName:value`

**Example:** `type:core/paragraph`

Finds elements with `data-type="core/paragraph"`.

---

### `contextual` - Hierarchical Selector

**Format:** `ancestor >> descendant`

**Example:** `.editor-styles-wrapper >> h1.wp-block`

Useful when element needs context to be unique.

---

## Best Practices

### 1. Choose the Right Completion Type

| User Action | Completion Type |
|-------------|-----------------|
| Click a button | `clickTarget` |
| Type in a field | `manual` or `domValueChanged` |
| Select from dropdown | `wpData` |
| Read information | `manual` |

### 2. Use Robust Locators

**Priority order (highest to lowest):**
1. `wpBlock` - For block editor content
2. `role` - For standard UI elements
3. `ariaLabel` - For labeled elements
4. `dataAttribute` - For elements with data-* attributes
5. `css` - As fallback only

### 3. Add Preconditions for Dynamic Content

If your step targets something that might not exist:
- Use `insertBlock` to create blocks
- Use `ensureSidebarOpen` to ensure panels are visible
- Use `openInserter` if targeting inserter content

### 4. Write Clear Instructions

- Be specific: "Click the blue Publish button" vs "Click Publish"
- Mention prerequisites: "After entering a title, click Next"
- Keep it brief but complete

### 5. Test on Fresh Pages

Always test your tour on:
- A new page/post (empty state)
- An existing page/post (with content)
- Different screen sizes

---

## Example: Complete Tour Step

```json
{
  "title": "Add a paragraph",
  "instruction": "Click inside the paragraph block and type some content. Click Next when done.",
  "target": {
    "locators": [
      {
        "type": "wpBlock",
        "value": "inserted:content-block",
        "weight": 100
      },
      {
        "type": "wpBlock",
        "value": "type:core/paragraph",
        "weight": 90,
        "fallback": true
      }
    ],
    "constraints": {
      "visible": true,
      "inEditorIframe": true,
      "withinContainer": ".editor-styles-wrapper"
    }
  },
  "preconditions": [
    {
      "type": "insertBlock",
      "params": {
        "blockName": "core/paragraph",
        "markerId": "content-block"
      }
    }
  ],
  "completion": {
    "type": "manual"
  }
}
```

---

## Troubleshooting

### Step advances too quickly

- Change completion type from `clickTarget` to `manual`
- Check if there are synthetic/programmatic clicks happening

### Element not found

- Check the browser console for `[ACT resolveTarget]` logs
- Verify the element exists in the editor iframe
- Add more fallback locators
- Ensure preconditions run before element is needed

### Block not found on new pages

- Add `insertBlock` precondition
- Use `wpBlock:inserted:markerId` locator

### Tour doesn't start

- Check URL has `?act_tour=ID` parameter
- Verify tour is published
- Check browser console for errors

---

## Starting Tours via URL

Add the tour ID as a URL parameter:

```
/wp-admin/post-new.php?post_type=page&act_tour=58
```

This auto-starts tour #58 when the page loads.
