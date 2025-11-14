// lib/getUserName.ts
export function getUserName(session: any) {
  const full = session?.user?.user_metadata?.full_name;
  const email = session?.user?.email;

  // Usar nombre real si existe
  if (full) {
    const [firstName] = full.split(" ");
    return {
      firstName,
      fullName: full,
    };
  }

  // Fallback: email
  if (email) {
    const firstName = email.split("@")[0].split(".")[0];
    return {
      firstName,
      fullName: firstName,
    };
  }

  return { firstName: "", fullName: "" };
}
