import { MessageSquareText } from "lucide-react";

export default function FeedbackFab() {
  return (
    <a className="feedback-fab" href="/#feedback" aria-label="Share feedback">
      <MessageSquareText size={22} />
      <span>Feedback</span>
    </a>
  );
}
