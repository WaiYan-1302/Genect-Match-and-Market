import IdentityCapture from "../../components/IdentityCapture";

export const metadata = {
  title: "ID card capture | GENECT Buddy",
  description: "Guided ID card camera capture with front, edge and movement views.",
  robots: { index: false, follow: false },
};

export default function IdentityPage() {
  return <IdentityCapture />;
}
