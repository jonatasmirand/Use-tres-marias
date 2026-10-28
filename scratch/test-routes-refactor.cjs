async function runTests() {
  const check = async (name, url, expectedStatus, expectedLocation = null) => {
    try {
      const res = await fetch(url, { redirect: "manual" });
      const status = res.status;
      const location = res.headers.get("location");
      const passStatus = status === expectedStatus;
      const passLoc = expectedLocation === null || (location && location.includes(expectedLocation));
      const passed = passStatus && passLoc;
      console.log(`[${passed ? "PASS" : "FAIL"}] ${name}`);
      console.log(`       URL: ${url}`);
      console.log(`       Status: ${status} (esperado: ${expectedStatus})`);
      if (location || expectedLocation) {
        console.log(`       Location: ${location} (esperado conter: ${expectedLocation})`);
      }
      return passed;
    } catch (e) {
      console.log(`[FAIL] ${name} - Error: ${e.message}`);
      return false;
    }
  };

  console.log("=== BATERIA DE TESTES DE ROTAS E SEGURANÇA ===\n");
  await check("1. Acessar /cadastro sem sessão", "http://localhost:3000/cadastro", 200);
  await check("2. Acessar /login sem sessão", "http://localhost:3000/login", 200);
  await check("3. Acessar rota extinta /conta", "http://localhost:3000/conta", 404);
  await check("4. Acessar rota extinta /conta/cadastro", "http://localhost:3000/conta/cadastro", 404);
  await check("5. Acessar /cliente sem sessão", "http://localhost:3000/cliente", 307, "/login?next=%2Fcliente");
  await check("6. Acessar /cliente/pedidos sem sessão", "http://localhost:3000/cliente/pedidos", 307, "/login?next=%2Fcliente%2Fpedidos");
  await check("7. Acessar /checkout sem sessão", "http://localhost:3000/checkout", 307, "/login?next=%2Fcheckout");
  await check("8. Acessar /admin sem permissão admin", "http://localhost:3000/admin", 404);
  await check("9. Acessar /api/admin/products sem permissão admin", "http://localhost:3000/api/admin/products", 404);
  await check("10. Acessar vitrine pública /", "http://localhost:3000/", 200);
  await check("11. Acessar categoria pública /vestidos", "http://localhost:3000/vestidos", 200);
  console.log("\n=== TESTES CONCLUÍDOS ===");
}

runTests();
