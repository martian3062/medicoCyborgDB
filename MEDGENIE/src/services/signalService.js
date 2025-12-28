export const sendOffer = async (offer) => {
  const res = await fetch("http://127.0.0.1:8000/api/signal/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offer })
  });
  return await res.json();
};
