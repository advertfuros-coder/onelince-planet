# 🎨 Admin Panel Component Library

## Design Patterns from Industry Leaders

This document showcases the UI patterns and components used by leading e-commerce admin panels that should be implemented in Online Planet.

---

## 1. 📊 Dashboard Layout Patterns

### **Current Implementation**

```
┌──────────────────────────────────────────────────┐
│  Header (Fixed)                                   │
├────────┬─────────────────────────────────────────┤
│        │  Metric  │  Metric  │  Metric  │  Metric│
│  Sidebar│  Card    │  Card    │  Card    │  Card │
│  (Wide) │──────────────────────────────────────  │
│        │                                          │
│        │   Large Chart                            │
│        │                                          │
│        │                                          │
│        │──────────────────────────────────────  │
│        │                                          │
│        │   Another Chart                          │
│        │                                          │
└────────┴─────────────────────────────────────────┘

Issues:
❌ Sidebar too wide (takes 20% of screen)
❌ No visual hierarchy
❌ Charts take full width (hard to scan)
❌ No quick actions
❌ No recent activity feed
```

### **Recommended Implementation (Shopify Pattern)**

```
┌──────────────────────────────────────────────────┐
│  🔔 Alerts Bar (Critical notifications)          │
├──┬───────────────────────────────────────────────┤
│  │ Quick Actions (Prominent CTAs)                │
│S │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐    │
│i │ │+ New  │ │Pending│ │Low    │ │Pending│    │
│d │ │Product│ │Orders │ │Stock  │ │Sellers│    │
│e │ └───────┘ └───────┘ └───────┘ └───────┘    │
│b ├────────────────────────────────────────────  │
│a │  Key Metrics (Grid)                          │
│r │ ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐  │
│  │ │Revenue││Orders││  AOV ││ Conv ││Margin│  │
│  │ └──────┘└──────┘└──────┘└──────┘└──────┘  │
│  ├────────────────────────────────────────────  │
│  │ ┌─ Recent Activity ─┐ ┌─ Charts ─────────┐ │
│  │ │ • Order #123      │ │   Revenue Trend  │ │
│  │ │ • New seller      │ │                  │ │
│  │ │ • Low stock alert │ │   [Line Chart]   │ │
│  │ └───────────────────┘ └──────────────────┘ │
└──┴───────────────────────────────────────────────┘

Improvements:
✅ Alerts bar for critical issues
✅ Quick actions with counts
✅ 2-column layout for better scanning
✅ Activity feed for recent events
✅ Compact sidebar (icons only, expand on hover)
```

---

## 2. 🔍 Global Search (Command Palette)

### **Shopify Pattern**

```
Trigger: Cmd/Ctrl + K

┌──────────────────────────────────────────────┐
│  🔍  Search for anything...              ⌘K  │
├──────────────────────────────────────────────┤
│  Recent                                       │
│  └─ View Order #12345                        │
│  └─ Edit Product "Widget X"                  │
│  └─ Seller "ABC Store"                       │
├──────────────────────────────────────────────┤
│  Quick Actions                                │
│  └─ + Create Product                         │
│  └─ 📦 View Pending Orders                  │
│  └─ 📊 Generate Report                      │
└──────────────────────────────────────────────┘

After typing "order 123":

┌──────────────────────────────────────────────┐
│  🔍  order 123                           ⌘K  │
├──────────────────────────────────────────────┤
│  Orders (3)                              →    │
│  └─ #12345 - Delivered - ₹2,999 - 2hrs ago  │
│  └─ #12389 - Pending - ₹1,500 - 1 day ago   │
│  └─ #12301 - Shipped - ₹5,200 - 3 days ago  │
├──────────────────────────────────────────────┤
│  Customers (1)                           →    │
│  └─ John Doe (Customer #1234)               │
└──────────────────────────────────────────────┘

Features:
✅ Instant search (200ms debounce)
✅ Category tabs (Orders, Products, Customers)
✅ Recent searches
✅ Keyboard navigation
✅ Quick actions
✅ Highlight matching text
```

### **Implementation**

```jsx
// src/components/admin/CommandPalette.jsx
import { Dialog, Combobox } from "@headlessui/react";
import { useHotkeys } from "react-hotkeys-hook";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Open with Cmd+K
  useHotkeys("cmd+k, ctrl+k", (e) => {
    e.preventDefault();
    setIsOpen(true);
  });

  const results = useSearch(query); // Custom hook

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <Combobox onChange={handleSelect}>
        <Combobox.Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search orders, products, customers..."
        />

        <Combobox.Options>
          {results.orders.length > 0 && (
            <ResultGroup title="Orders" items={results.orders} />
          )}
          {results.products.length > 0 && (
            <ResultGroup title="Products" items={results.products} />
          )}
        </Combobox.Options>
      </Combobox>
    </Dialog>
  );
}
```

---

## 3. 🔔 Notification System

### **Amazon Seller Central Pattern**

```
┌─ Notifications ──────────────────────────────┐
│  🔴 Critical (2)     🟠 High (5)    ⚪ All   │
├──────────────────────────────────────────────┤
│  🔴  Order #12345 - Payment Failed           │
│      Customer's payment could not be proces..│
│      [View Order] [Contact Customer]    2m   │
├──────────────────────────────────────────────┤
│  🟠  Low Stock Alert - Widget X              │
│      Only 3 units remaining in stock         │
│      [Restock] [View Sales]            15m   │
├──────────────────────────────────────────────┤
│  ⚪  New seller registration                 │
│      ABC Electronics submitted application   │
│      [Review] [Approve]                45m   │
├──────────────────────────────────────────────┤
│  ⚪  Return request - Order #12340           │
│      Customer requested return for "Defec.." │
│      [Approve] [Reject] [Message]      2h    │
└──────────────────────────────────────────────┘

Features:
✅ Priority filtering (Critical, High, All)
✅ Action buttons in notification
✅ Time stamps
✅ Expandable details
✅ Mark as read/unread
✅ Sound alerts for critical
```

### **Implementation**

```jsx
// src/components/admin/NotificationBell.jsx
export default function NotificationBell() {
  const { notifications, unreadCount } = useNotifications();

  return (
    <Popover>
      <Popover.Button className="relative">
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </Popover.Button>

      <Popover.Panel>
        <NotificationList>
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              priority={notif.priority}
              title={notif.title}
              message={notif.message}
              actions={notif.actions}
              time={notif.createdAt}
            />
          ))}
        </NotificationList>
      </Popover.Panel>
    </Popover>
  );
}

// Notification types
const NotificationTypes = {
  NEW_ORDER: { icon: "🛒", priority: "high", sound: true },
  LOW_STOCK: { icon: "⚠️", priority: "high", sound: false },
  RETURN_REQUEST: { icon: "↩️", priority: "normal", sound: false },
  PAYMENT_FAILED: { icon: "🔴", priority: "critical", sound: true },
  SELLER_REGISTRATION: { icon: "👤", priority: "normal", sound: false },
};
```

---

## 4. 📋 Data Table with Bulk Operations

### **Shopify Pattern**

```
┌─ Products (1,234) ─────────────────────────────┐
│  [☑ 15 selected]  [Delete] [Export] [Edit]    │
│  🔍 Search    [Filter ▾] [Sort ▾]   [+ Add]   │
├───────────────────────────────────────────────┤
│ ☑ │ Image │ Name        │ Price │ Stock │ Status │
│ ☑ │ [img] │ Widget X    │ ₹999  │ 45    │ Active │
│ ☑ │ [img] │ Gadget Y    │ ₹1299 │ 12 ⚠️ │ Active │
│ ☐ │ [img] │ Tool Z      │ ₹599  │ 89    │ Active │
│ ☐ │ [img] │ Product A   │ ₹1999 │ 0  🔴 │ Draft  │
└───────────────────────────────────────────────┘
             [← Prev] Page 2 of 25 [Next →]

Table Features:
✅ Select all checkbox
✅ Bulk action bar (appears when selected)
✅ Inline actions on hover (edit, delete, duplicate)
✅ Visual indicators (⚠️ low stock, 🔴 out of stock)
✅ Sortable columns
✅ Resizable columns
✅ Sticky header
✅ Row highlight on hover
```

### **Implementation**

```jsx
// src/components/admin/DataTable.jsx
import { useTable, useSortBy, useRowSelect } from "react-table";

export default function DataTable({ data, columns, onBulkAction }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
  } = useTable({ columns, data }, useSortBy, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => [
      {
        id: "selection",
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <Checkbox {...getToggleAllRowsSelectedProps()} />
        ),
        Cell: ({ row }) => <Checkbox {...row.getToggleRowSelectedProps()} />,
      },
      ...columns,
    ]);
  });

  return (
    <>
      {selectedFlatRows.length > 0 && (
        <BulkActionBar
          count={selectedFlatRows.length}
          onDelete={() => onBulkAction("delete", selectedFlatRows)}
          onExport={() => onBulkAction("export", selectedFlatRows)}
        />
      )}

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  {column.isSorted && (
                    <span>{column.isSortedDesc ? " ↓" : " ↑"}</span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
```

---

## 5. 🎯 Quick Actions Dashboard Widget

### **Flipkart Pattern**

```
┌─ Quick Actions ──────────────────────────────┐
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │    +     │  │    📦    │  │    ⚠️    │   │
│  │  Create  │  │ Pending  │  │   Low    │   │
│  │ Product  │  │  Orders  │  │  Stock   │   │
│  │          │  │   (23)   │  │   (5)    │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │    👤    │  │    📊    │  │    📤    │   │
│  │ Pending  │  │ Generate │  │  Bulk    │   │
│  │ Sellers  │  │  Report  │  │ Import   │   │
│  │   (8)    │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────────────────────────────┘

Card States:
• Default: White background, gray border
• Hover: Blue border, slight lift (shadow)
• With count: Orange/Red badge
• Active: Blue background (if currently on that page)
```

### **Implementation**

```jsx
// src/components/admin/QuickActions.jsx
export default function QuickActions() {
  const { pendingOrders, lowStock, pendingSellers } = useStats();

  const actions = [
    {
      icon: PlusIcon,
      label: "Create Product",
      href: "/admin/products/add",
      color: "blue",
    },
    {
      icon: ClockIcon,
      label: "Pending Orders",
      href: "/admin/orders?status=pending",
      count: pendingOrders,
      color: "orange",
    },
    {
      icon: AlertIcon,
      label: "Low Stock",
      href: "/admin/products?stock=low",
      count: lowStock,
      color: "red",
    },
    {
      icon: UserIcon,
      label: "Pending Sellers",
      href: "/admin/sellers?status=pending",
      count: pendingSellers,
      color: "purple",
    },
    {
      icon: ChartIcon,
      label: "Generate Report",
      onClick: openReportModal,
      color: "green",
    },
    {
      icon: UploadIcon,
      label: "Bulk Import",
      onClick: openImportModal,
      color: "indigo",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {actions.map((action) => (
        <QuickActionCard key={action.label} {...action} />
      ))}
    </div>
  );
}

function QuickActionCard({ icon: Icon, label, count, color, href, onClick }) {
  const content = (
    <div className={`quick-action-card ${color}`}>
      <Icon className="w-8 h-8" />
      <span className="label">{label}</span>
      {count > 0 && <span className="badge">{count}</span>}
    </div>
  );

  return href ? (
    <Link href={href}>{content}</Link>
  ) : (
    <button onClick={onClick}>{content}</button>
  );
}
```

---

## 6. 📈 Metric Cards (KPI Display)

### **Amazon Seller Central Pattern**

```
┌─ Total Revenue ────────┐  ┌─ Orders ───────────┐
│  ₹1,45,678             │  │  1,234             │
│  ↑ 24.5%   ▲ vs prev   │  │  ↑ 12%   ▲ vs prev │
│                        │  │                     │
│  [View Details →]     │  │  [View Orders →]   │
└────────────────────────┘  └─────────────────────┘

Card Types:
1. Primary Metric (Large number)
2. Trend Indicator (Arrow + percentage)
3. Comparison Period (vs previous period)
4. Sparkline Chart (optional mini chart)
5. Action Link (View details)

Color Coding:
• Green: Positive trend (up is good)
• Red: Negative trend (down is bad)
• Blue: Neutral information
• Orange: Warning/Action needed
```

### **Implementation**

```jsx
// src/components/admin/MetricCard.jsx
export default function MetricCard({
  title,
  value,
  change,
  trend, // 'up' | 'down'
  comparison = "vs last period",
  link,
  icon: Icon,
  color = "blue",
  sparklineData,
}) {
  const isPositive = trend === "up";
  const changeColor = isPositive ? "text-green-600" : "text-red-600";

  return (
    <div className={`metric-card border-l-4 border-${color}-500`}>
      <div className="header">
        <span className="title">{title}</span>
        {Icon && <Icon className={`w-5 h-5 text-${color}-500`} />}
      </div>

      <div className="value">{value}</div>

      <div className="footer">
        <div className={`change ${changeColor}`}>
          {isPositive ? "↑" : "↓"} {change}
          <span className="comparison">{comparison}</span>
        </div>

        {sparklineData && <Sparkline data={sparklineData} color={color} />}
      </div>

      {link && (
        <Link href={link} className="action-link">
          View Details →
        </Link>
      )}
    </div>
  );
}
```

---

## 7. 🎨 Color System

### **Semantic Colors**

```css
/* Success States */
--color-success-50: #ecfdf5;
--color-success-500: #10b981;
--color-success-700: #047857;

/* Error States */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-700: #b91c1c;

/* Warning States */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-700: #b45309;

/* Info States */
--color-info-50: #eff6ff;
--color-info-500: #3b82f6;
--color-info-700: #1d4ed8;

/* Neutral/Gray */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;

/* Brand Colors */
--color-primary: #2563eb;
--color-secondary: #7c3aed;
```

### **Usage Guidelines**

```jsx
// ✅ Good - Semantic colors
<button className="bg-success-500 hover:bg-success-600">
  Approve
</button>

<div className="text-error-600 bg-error-50">
  Error: Payment failed
</div>

// ❌ Bad - Hardcoded colors
<button className="bg-green-500">Approve</button>
<div className="text-red-600">Error: Payment failed</div>
```

---

## 8. 📱 Responsive Breakpoints

### **Mobile-First Approach**

```css
/* Breakpoints */
sm:  640px  /* Mobile landscape, small tablets */
md:  768px  /* Tablets */
lg:  1024px /* Desktop */
xl:  1280px /* Large desktop */
2xl: 1536px /* Extra large */

/* Usage in Tailwind */
.grid {
  @apply grid-cols-1; /* Mobile: Stack */
  @apply md:grid-cols-2; /* Tablet: 2 columns */
  @apply lg:grid-cols-4; /* Desktop: 4 columns */
}
```

### **Responsive Patterns**

```jsx
// Dashboard Layout
<div className="dashboard">
  {/* Sidebar: Hidden on mobile, icon-only on tablet, full on desktop */}
  <Sidebar className="hidden md:block lg:w-64" />

  {/* Main Content */}
  <div className="flex-1 p-4 md:p-6 lg:p-8">
    {/* Metrics: Stack on mobile, 2 cols on tablet, 4 on desktop */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard ... />
    </div>

    {/* Charts: Stack on mobile, side-by-side on desktop */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Chart ... />
    </div>
  </div>
</div>
```

---

## 9. ⌨️ Keyboard Shortcuts

### **Essential Shortcuts**

```
Global:
  Cmd/Ctrl + K     → Open search
  Cmd/Ctrl + /     → Show shortcuts help
  Esc             → Close modal/panel

Navigation:
  G then D        → Go to Dashboard
  G then O        → Go to Orders
  G then P        → Go to Products
  G then C        → Go to Customers

Actions:
  Cmd/Ctrl + N     → New (product/order depending on page)
  Cmd/Ctrl + S     → Save
  Cmd/Ctrl + E     → Edit
  Cmd/Ctrl + Delete → Delete selected

Table Navigation:
  ↑ / ↓           → Navigate rows
  Enter           → Open selected row
  Space           → Select/deselect row
  Cmd/Ctrl + A     → Select all
```

### **Implementation**

```jsx
// src/hooks/useKeyboardShortcuts.js
import { useHotkeys } from "react-hotkeys-hook";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts() {
  const router = useRouter();

  // Global search
  useHotkeys("cmd+k, ctrl+k", (e) => {
    e.preventDefault();
    openSearch();
  });

  // Navigation
  useHotkeys("g,d", () => router.push("/admin/dashboard"));
  useHotkeys("g,o", () => router.push("/admin/orders"));
  useHotkeys("g,p", () => router.push("/admin/products"));

  // Actions
  useHotkeys("cmd+n, ctrl+n", (e) => {
    e.preventDefault();
    openNewModal();
  });
}

// Shortcut Help Modal
function ShortcutHelp() {
  return (
    <Modal>
      <h2>Keyboard Shortcuts</h2>

      <ShortcutSection title="Navigation">
        <Shortcut keys={["Cmd", "K"]} description="Open search" />
        <Shortcut keys={["G", "D"]} description="Go to Dashboard" />
        <Shortcut keys={["G", "O"]} description="Go to Orders" />
      </ShortcutSection>

      <ShortcutSection title="Actions">
        <Shortcut keys={["Cmd", "N"]} description="Create new" />
        <Shortcut keys={["Cmd", "S"]} description="Save" />
      </ShortcutSection>
    </Modal>
  );
}
```

---

## 10. 🎯 Loading States

### **Skeleton Loaders (Better than Spinners)**

```jsx
// ❌ Bad: Generic spinner
<div className="loading">
  <Spinner />
  Loading...
</div>

// ✅ Good: Content-aware skeleton
<div className="skeleton-card">
  <div className="skeleton-line h-8 w-32" />
  <div className="skeleton-line h-12 w-full mt-2" />
  <div className="skeleton-line h-4 w-24 mt-4" />
</div>
```

### **Skeleton Component**

```jsx
// src/components/admin/Skeleton.jsx
export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i}>
              <div className="h-4 bg-gray-200 rounded w-full" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            {Array.from({ length: cols }).map((_, j) => (
              <td key={j}>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage
function ProductsList() {
  const { data, loading } = useProducts();

  if (loading) {
    return <SkeletonTable rows={10} cols={6} />;
  }

  return <DataTable data={data} />;
}
```

---

## Summary: Key Takeaways

### Must-Have Components (Priority 🔴)

1. **Global Search** - Cmd+K search everything
2. **Notification Bell** - Real-time alerts
3. **Bulk Action Bar** - Multi-select operations
4. **Quick Actions** - One-click common tasks
5. **Responsive Layout** - Mobile-friendly
6. **Loading Skeletons** - Better UX than spinners

### Nice-to-Have Components (Priority 🟡)

7. **Keyboard Shortcuts** - Power user efficiency
8. **Customizable Dashboard** - Personalization
9. **Activity Feed** - Recent actions log
10. **Metric Cards** - Visual KPI display

### Future Enhancements (Priority 🟢)

11. **Drag-Drop Tables** - Reorder items
12. **In-line Editing** - Quick updates
13. **Advanced Filters** - Complex queries
14. **Export to Excel/PDF** - Data downloads

---

**Next Steps:**

1. Review this document with design team
2. Create Figma mockups for each component
3. Build component library in Storybook
4. Implement Phase 1 components (Week 1-3)
