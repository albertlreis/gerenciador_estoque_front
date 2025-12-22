export async function fetchViaCep(cepDigits) {
  const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
  const data = await res.json();
  return data;
}
