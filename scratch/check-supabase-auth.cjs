const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://offedwqruronmkhzkofn.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5AROaZgcZLS411oXyrDbOw_MzhXsJ4D';
const supabase = createClient(url, key);

async function check() {
  console.log('Verificando status do provedor de e-mail no Supabase...');
  console.log('Projeto:', url);
  
  const testEmail = `probe_check_${Date.now()}@testdomain.com`;
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'SenhaTesteValida123!@#',
  });

  if (error && (error.code === 'email_provider_disabled' || error.message?.includes('disabled'))) {
    console.log('\n❌ STATUS: PROVEDOR DE E-MAIL AINDA DESATIVADO NO SUPABASE');
    console.log('Código retornado:', error.code);
    console.log('Mensagem:', error.message);
    console.log('\nSiga o passo a passo enviado para ativar o provedor "Email" e clicar em "Save".');
    process.exit(1);
  } else if (error) {
    console.log('\nℹ️ STATUS: Provedor de e-mail ativo (retornou erro de negócio normal, não de provedor desativado):');
    console.log('Código:', error.code, '| Mensagem:', error.message);
    process.exit(0);
  } else {
    console.log('\n✅ STATUS: PROVEDOR DE E-MAIL ATIVO E FUNCIONANDO COM SUCESSO!');
    console.log('Usuário de teste criado temporariamente:', data.user?.id);
    process.exit(0);
  }
}

check();
