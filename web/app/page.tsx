"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Parallax Background */}
      <div className="fixed inset-0 -z-10">
        {/* Layer 1 - Base gradient với parallax mạnh hơn */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"
          style={{
            transform: `translateY(${scrollY * 0.8}px) scale(${
              1 + scrollY * 0.0002
            })`,
          }}
        />

        {/* Layer 2 - Animated shapes với parallax mạnh */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.6}px) translateX(${
              scrollY * 0.2
            }px)`,
          }}
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-2xl animate-pulse opacity-60" />
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-300 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1000 opacity-60" />
          <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-indigo-300 dark:bg-indigo-700 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-2000 opacity-60" />
          <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-pink-300 dark:bg-pink-700 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-3000 opacity-60" />
        </div>

        {/* Layer 3 - Geometric patterns với parallax chậm nhưng có scale */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            transform: `translateY(${scrollY * 0.2}px) scale(${
              1 + scrollY * 0.0001
            })`,
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-blue-400 dark:text-blue-600"
                />
              </pattern>
              <pattern
                id="dots"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="1"
                  fill="currentColor"
                  className="text-purple-400 dark:text-purple-600"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Layer 4 - Floating particles */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.4}px) rotate(${
              scrollY * 0.1
            }deg)`,
          }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                transform: `scale(${0.5 + Math.sin(scrollY * 0.01 + i) * 0.5})`,
              }}
            />
          ))}
        </div>

        {/* Layer 5 - Waves effect */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        >
          <svg
            className="absolute bottom-0 w-full h-32"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d={`M0,60 C150,${40 + scrollY * 0.1} 350,${
                80 + scrollY * 0.05
              } 500,60 C650,${40 + scrollY * 0.1} 850,${
                80 + scrollY * 0.05
              } 1000,60 L1000,120 L0,120 Z`}
              fill="currentColor"
              className="text-indigo-300 dark:text-indigo-600"
            />
          </svg>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center min-h-screen flex items-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Chat App
            <span className="block text-blue-600 dark:text-blue-400">
              Thời đại mới
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Kết nối mọi người, mọi lúc, mọi nơi với nền tảng chat hiện đại. Trải
            nghiệm giao tiếp nhanh chóng, an toàn và thú vị.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
            >
              Bắt đầu ngay
            </Link>
            <Link
              href="/chats"
              className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200"
            >
              Trải nghiệm ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Tính năng nổi bật
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Chat thời gian thực
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Gửi và nhận tin nhắn ngay lập tức với công nghệ Socket.IO tiên
                tiến
              </p>
            </div>

            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Bảo mật tuyệt đối
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Mã hóa đầu cuối, xác thực JWT và các biện pháp bảo mật hàng đầu
              </p>
            </div>

            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Quản lý bạn bè
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Hệ thống kết bạn thông minh với trạng thái online/offline
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative px-6 py-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Công nghệ tiên tiến
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            Xây dựng với những công nghệ hiện đại nhất để đảm bảo hiệu suất và
            trải nghiệm tốt nhất
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              "Next.js 14",
              "TypeScript",
              "Socket.IO",
              "MongoDB",
              "Express.js",
              "Tailwind CSS",
              "JWT Authentication",
              "Real-time Updates",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-20 bg-blue-600/90 backdrop-blur-sm text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn sàng bắt đầu cuộc trò chuyện?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Tham gia cộng đồng của chúng tôi và kết nối với mọi người ngay hôm
            nay
          </p>
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-8 bg-gray-900/90 backdrop-blur-sm text-white text-center">
        <p>
          &copy; 2025 Chat App. Được xây dựng với ❤️ bằng công nghệ hiện đại.
        </p>
      </footer>
    </div>
  );
}
