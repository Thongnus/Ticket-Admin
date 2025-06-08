#!/bin/bash

echo "🔧 Fixing Next.js installation..."

# Kiểm tra Node.js
echo "📋 Checking Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

# Kiểm tra npm
echo "📋 Checking npm..."
if command -v npm &> /dev/null; then
    echo "✅ npm version: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Xóa node_modules và package-lock.json
echo "🗑️ Cleaning up..."
rm -rf node_modules package-lock.json

# Cài đặt lại
echo "📦 Reinstalling dependencies..."
npm install

# Kiểm tra Next.js
echo "🔍 Checking Next.js installation..."
if [ -f "node_modules/.bin/next" ]; then
    echo "✅ Next.js installed successfully"
else
    echo "❌ Next.js installation failed"
    echo "💡 Trying alternative installation..."
    npm install next@latest --save
fi

echo "🎉 Setup completed!"
echo "🚀 Try running: npm run dev"
