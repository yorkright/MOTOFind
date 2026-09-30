import ChatContainer from "@/components/chat/ChatContainer";

export const metadata = {
  title: "Motofind",
  description: "Chat with the Motofind AI car recommendation assistant.",
};

export default function ChatPage() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-black">
      <ChatContainer />
    </main>
  );
}