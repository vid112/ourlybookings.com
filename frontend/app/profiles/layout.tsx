import { AgeGate } from "@/components/age-gate";

export default function ProfilesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AgeGate />
      {children}
    </>
  );
}
