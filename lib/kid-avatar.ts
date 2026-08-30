export function getKidAvatar(name: string, avatar: string | null | undefined) {
  const customAvatar = avatar?.trim();

  if (customAvatar) {
    return customAvatar.slice(0, 1).toUpperCase();
  }

  return name.trim().slice(0, 1).toUpperCase() || "?";
}