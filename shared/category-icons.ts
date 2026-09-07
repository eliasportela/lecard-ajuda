export const categoryIconNames = ['Folder', 'BookOpen', 'ClipboardList', 'Palette', 'Bike', 'MonitorSmartphone', 'ChartNoAxesCombined', 'ShoppingCart', 'CreditCard', 'WalletCards', 'CircleDollarSign', 'Users', 'UserRound', 'MessageCircleMore', 'Megaphone', 'PlugZap', 'Settings', 'Settings2', 'Download', 'Printer', 'ScreenShare', 'CircleAlert', 'ChartNoAxesColumnIncreasing', 'Package', 'Truck', 'Store', 'ReceiptText', 'CircleHelp', 'Lightbulb', 'ShieldCheck', 'Wrench'] as const
export type CategoryIconName = typeof categoryIconNames[number]
export const categoryIconOptions: Array<{ name: CategoryIconName; label: string; keywords?: string }> = [
  { name: 'Folder', label: 'Pasta' }, { name: 'BookOpen', label: 'Cardápio', keywords: 'livro menu' }, { name: 'ClipboardList', label: 'Gestor de Pedidos', keywords: 'lista pedido' },
  { name: 'Palette', label: 'Aparência do App', keywords: 'tema cores design' }, { name: 'Bike', label: 'Rotas e Entregador', keywords: 'moto entrega aplicativo' }, { name: 'MonitorSmartphone', label: 'PDV', keywords: 'monitor celular ponto de venda' },
  { name: 'ChartNoAxesCombined', label: 'Dashboard e Relatórios', keywords: 'gráfico métricas' }, { name: 'MessageCircleMore', label: 'Bot do WhatsApp', keywords: 'mensagem conversa atendimento' }, { name: 'Megaphone', label: 'Marketing e Promoções', keywords: 'campanha anúncio' },
  { name: 'PlugZap', label: 'Integrações', keywords: 'plug conexão' }, { name: 'Settings2', label: 'Configurações da Empresa', keywords: 'ajustes empresa' }, { name: 'Download', label: 'Instalações', keywords: 'baixar instalar' },
  { name: 'Printer', label: 'Impressoras', keywords: 'impressão' }, { name: 'ScreenShare', label: 'Acesso Remoto', keywords: 'tela compartilhar' }, { name: 'CircleAlert', label: 'Erros e Soluções', keywords: 'alerta problema' },
  { name: 'ShoppingCart', label: 'Carrinho' },
  { name: 'CreditCard', label: 'Cartão' }, { name: 'WalletCards', label: 'Carteira' }, { name: 'CircleDollarSign', label: 'Financeiro' },
  { name: 'Users', label: 'Usuários' }, { name: 'UserRound', label: 'Pessoa' }, { name: 'Settings', label: 'Configurações' },
  { name: 'ChartNoAxesColumnIncreasing', label: 'Gráfico' }, { name: 'Package', label: 'Produto' }, { name: 'Truck', label: 'Entrega' },
  { name: 'Store', label: 'Loja' }, { name: 'ReceiptText', label: 'Fiscal', keywords: 'documento nota recibo' }, { name: 'CircleHelp', label: 'Ajuda' },
  { name: 'Lightbulb', label: 'Dica' }, { name: 'ShieldCheck', label: 'Segurança' }, { name: 'Wrench', label: 'Ferramentas' }
]
