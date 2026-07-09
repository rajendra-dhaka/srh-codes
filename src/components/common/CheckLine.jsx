import { CheckCircle2 } from "lucide-react";

export function CheckLine({ text }) {
  return <div className="check-line"><CheckCircle2 size={17} /> <span>{text}</span></div>;
}
