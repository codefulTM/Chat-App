# Hướng dẫn sử dụng ThemeContext

## 📝 Tổng quan

ThemeContext cung cấp một cách tập trung để quản lý theme trong toàn bộ ứng dụng, thay thế cho việc sử dụng MutationObserver và duplicate logic ở nhiều component.

## 🔧 Cách triển khai

### 1. Cập nhật `app/layout.tsx`

```tsx
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              const savedTheme = localStorage.getItem('theme');
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              
              if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            })();
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthProvider>
            <ThemeProvider>
              {" "}
              {/* Thêm ThemeProvider */}
              <ClientLayout>{children}</ClientLayout>
            </ThemeProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
```

### 2. Cập nhật `Menu.tsx`

**Trước:**

```tsx
const [isDark, setIsDark] = useState<boolean>(false);

useEffect(() => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode = savedTheme === "dark" || ...;
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }
}, []);

const handleThemeChange = (theme: "light" | "dark") => {
  if (typeof window !== "undefined") {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    setIsDark(theme === "dark");
  }
};
```

**Sau:**

```tsx
import { useTheme } from "@/contexts/ThemeContext";

export default function Menu({ setIsMenuVisible }: { setIsMenuVisible: any }) {
  const { theme, setTheme } = useTheme();

  // Xóa toàn bộ useEffect và handleThemeChange cũ

  return (
    <div>
      {/* ... */}
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
    </div>
  );
}
```

### 3. Cập nhật `Conversation.tsx`

**Trước:**

```tsx
const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

// Theo dõi thay đổi theme
useEffect(() => {
  const checkDarkMode = () => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  };

  checkDarkMode();

  const observer = new MutationObserver(checkDarkMode);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}, []);
```

**Sau:**

```tsx
import { useTheme } from "@/contexts/ThemeContext";

export default function Conversation({ ... }) {
  const { isDarkMode } = useTheme();

  // Xóa toàn bộ useState và useEffect theo dõi theme

  // Sử dụng isDarkMode như bình thường
  return (
    <UserSearch
      isDarkMode={isDarkMode}
      // ...
    />
  );
}
```

### 4. Cập nhật `UserSearch.tsx` (Tùy chọn - loại bỏ prop drilling)

**Trước:**

```tsx
export default function UserSearch({
  isDarkMode,
}: // ...
{
  isDarkMode: boolean;
  // ...
}) {
  // Sử dụng isDarkMode
}
```

**Sau:**

```tsx
import { useTheme } from "@/contexts/ThemeContext";

export default function UserSearch({}: // Xóa isDarkMode khỏi props
// ...
{
  // ...
}) {
  const { isDarkMode } = useTheme();

  // Sử dụng isDarkMode như bình thường
}
```

## ✨ Lợi ích

1. **Không còn duplicate code**: Logic theme chỉ ở một nơi
2. **Không cần MutationObserver**: React Context tự động re-render khi theme thay đổi
3. **Không cần prop drilling**: Mọi component có thể dùng `useTheme()` trực tiếp
4. **Type-safe**: TypeScript đảm bảo type safety
5. **Dễ maintain**: Thay đổi logic theme chỉ cần sửa ở ThemeContext
6. **Performance tốt hơn**: Không cần observer, chỉ re-render khi cần thiết

## 🎯 API

### `useTheme()` hook trả về:

- `theme`: `"light" | "dark"` - Theme hiện tại
- `isDarkMode`: `boolean` - True nếu đang ở dark mode
- `setTheme(theme)`: Function để set theme cụ thể
- `toggleTheme()`: Function để toggle giữa light/dark

## 📌 Lưu ý

- Script trong `layout.tsx` vẫn cần giữ để tránh FOUC
- ThemeProvider phải wrap bên ngoài các component cần dùng theme
- Hook `useTheme()` chỉ dùng được trong Client Components (`"use client"`)
