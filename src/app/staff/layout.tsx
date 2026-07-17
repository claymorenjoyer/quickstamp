import NavBar from "@/components/NavBar";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main className="flex-1">{children}</main>
    </>
  );
}
