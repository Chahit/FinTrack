import { SignIn } from "@clerk/nextjs";
 
export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-background/80 backdrop-blur-sm border shadow-lg",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "bg-background text-foreground border hover:bg-muted",
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            footerAction: "text-muted-foreground",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-background border",
          },
        }}
      />
    </div>
  );
}
