fetch('http://localhost:3000/api/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'finmatrix.noreply@gmail.com', otp: '123456' })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
