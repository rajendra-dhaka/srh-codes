import { useMemo, useState } from "react";

export function useFeedbackMailto(email) {
  const [feedback, setFeedback] = useState({
    name: "",
    contact: "",
    message: "",
  });

  const updateFeedback = (field) => (event) => {
    setFeedback((current) => ({ ...current, [field]: event.target.value }));
  };

  const feedbackHref = useMemo(() => {
    const subject = `SRH Codes feedback${feedback.name ? ` from ${feedback.name}` : ""}`;
    const body = [
      "Hi SRH Codes team,",
      "",
      feedback.message || "I want to share this improvement/request:",
      "",
      `Name: ${feedback.name || "-"}`,
      `Contact: ${feedback.contact || "-"}`,
      "",
      "Sent from SRH Codes website feedback form.",
    ].join("\n");

    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, feedback]);

  return {
    feedback,
    feedbackHref,
    updateFeedback,
  };
}
