export default function AuthLayout({ children }) {
  return (
    <div className={`antialiased`}>
      <main>{children}</main>
    </div>
  );
}