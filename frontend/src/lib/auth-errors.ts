const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Email not confirmed':
    'メールアドレスが未確認です。受信トレイの確認メールを開くか、Supabase でメール確認をオフにしてください。',
  'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません。',
  'User already registered': 'このメールアドレスはすでに登録されています。',
}

export function translateAuthError(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? message
}
