import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#4F46E5',
            colorBackground: '#1F2937',
            colorText: '#F3F4F6',
            colorTextSecondary: '#9CA3AF',
            colorInputBackground: 'rgba(31, 41, 55, 0.5)',
            colorInputText: '#F3F4F6',
          },
          elements: {
            formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600",
            card: "bg-gray-800/50 backdrop-blur-xl border border-gray-700",
            headerTitle: "text-gray-200",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "bg-gray-700 border-gray-600 text-gray-200",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-gray-700/50 border-gray-600 text-gray-200",
            footerActionText: "text-gray-400",
            footerActionLink: "text-blue-400 hover:text-blue-500",
          },
        }}
      />
    </div>
  );
}
