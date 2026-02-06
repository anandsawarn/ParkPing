export const maskPhone = (phone) => {
  if (!phone) {
    return "";
  }

  const visible = phone.slice(-2);
  return `${"*".repeat(Math.max(phone.length - 2, 0))}${visible}`;
};
