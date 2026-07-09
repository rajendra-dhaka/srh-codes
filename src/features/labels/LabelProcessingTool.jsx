import { LabelProcessingProvider } from "./LabelProcessingContext";
import { LabelProcessingWorkspace } from "./LabelProcessingWorkspace";

export function LabelProcessingTool() {
  return (
    <LabelProcessingProvider>
      <LabelProcessingWorkspace />
    </LabelProcessingProvider>
  );
}
