import './globals.css';

export const metadata = {
  title: 'TextReply — AI-Powered Facebook Messenger Bot',
  description: 'Connect your Facebook Page and let AI handle your messages with context-aware replies powered by Google Gemini.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-mesh" />
        {children}
      </body>
    </html>
  );
}
