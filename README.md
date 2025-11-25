# SportShop (Expo + React Native)

Projeto mobile feito com **Expo + React Native** e **Supabase** para backend (autenticação, carrinho, cupons, promoções, avaliações e favoritos).

---

## 🔹 Visão Geral

- Aplicativo de e-commerce com telas principais e funcionalidades de admin.
- Autenticação via Supabase.
- Gerenciamento de carrinho, checkout com aplicação de cupom, histórico de pedidos, promoções e favoritos.

---

## 🔹 Principais Fluxos

- **Autenticação**: `LoginScreen` usa Supabase.  
- **Carrinho e Checkout**: adicionar em `ProductDetailsScreen`, visualizar em `CartScreen`, finalizar em `CheckoutScreen` (cria `orders` e `order_items`).  
- **Cupons**: criação/exibição em `CouponAdmin`, aplicação em `CheckoutScreen`.  
- **Promoções**: aplicar desconto em `PromoAdmin` e registrar em tabela `promotions`.  
- **Favoritos**: marcar/desmarcar em `ProductDetailsScreen` e listar em `FavoritesScreen`.  
- **Histórico**: `OrderHistoryScreen` recupera `orders` com `order_items` e `products`.

---

## 🔹 Configuração do Supabase e SQL

1. Crie um projeto no Supabase.  
2. Coloque todos os scripts SQL da criação das tabelas na pasta:
sql/EditorSupabase
3. Execute os scripts via **SQL Editor** no Supabase.

> **Observação importante:**  
> Produtos e imagens devem ser inseridos manualmente via Supabase (**Menu → Table Editor → products**).  
> O campo `image_url` deve conter o link da imagem (pode usar hospedagem própria ou Supabase Storage).

---

## 🔹 Conectar ao Projeto

No arquivo `src/lib/supabase.js`:

import { createClient } from '@supabase/supabase-js'

// Substitua pelos dados do seu projeto Supabase
const SUPABASE_URL = "SUA_URL_DO_SUPABASE"
const SUPABASE_ANON_KEY = "SUA_ANON_KEY"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


-- O SUPABASE_URL e SUPABASE_ANON_KEY podem ser encontrados em Settings → API do seu projeto Supabase.

Para Instalar Dependências

Instale o Expo CLI globalmente (se ainda não tiver):

npm install -g expo-cli


No diretório do projeto, instale dependências:

npm install
# ou
yarn install


Dependências adicionais usadas:

expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-community/datetimepicker
npm install @supabase/supabase-js


Rodar o projeto:

expo start
# Depois escolha Android / iOS / Web

 Fluxo de Cupons

O usuário insere o código no checkout.

O app valida na tabela coupons (is_active = true, end_date >= hoje, used_count < usage_limit).

Se válido, o desconto é aplicado sobre o total já com promoções de produtos.

Ao confirmar pedido, used_count é incrementado automaticamente.

 Para Fazer Contribuições

Fork → Crie uma branch → Commit → Push → Pull Request.

