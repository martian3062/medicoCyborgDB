export const translateText = async (text, target) => {
  const res = await fetch("http://127.0.0.1:8000/api/translate/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target_lang: target }),
  });

  return await res.json();
};
