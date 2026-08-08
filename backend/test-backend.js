const testBackend = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Vignan',
        type: 'Refund Request',
        amount: 15,
        description: 'I need a refund for $15'
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
};
testBackend();
