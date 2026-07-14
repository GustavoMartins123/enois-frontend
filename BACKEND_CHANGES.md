# Implementações necessárias no backend

## 1. Avatar da comunidade

Adicionar campo `avatar` (String, opcional) no `Community`.

**Modelo:**

```java
private String avatar; // URL da imagem de perfil da comunidade (CDN)
```

**Response atualizado (`GET /api/communities` e `GET /api/communities/{id}`):**

```json
{
  "id": "community_...",
  "name": "Devs BR",
  "description": "...",
  "topic": "TECNOLOGIA",
  "members": 42,
  "cover": "https://...",
  "avatar": "https://...",
  "joined": false
}
```

**Create/Update (`POST` / `PATCH`):**

```json
{
  "name": "...",
  "description": "...",
  "topic": "...",
  "cover": "https://...",
  "avatar": "https://..."
}
```

## 2. Feed da comunidade retornando 200 mas vazio

**Endpoint:** `GET /api/communities/{communityId}/feed`

**Comportamento atual:** retorna `200 OK` com `{"items":[],"nextCursor":null}` mesmo quando existem posts na comunidade.

**Provável causa:** o feed está filtrando por um campo errado ou o `communityId` não está sendo salvo corretamente nos posts ao criar via `POST /api/feed/posts`.

**Passos pra debug:**

1. Criar um post com `communityId: "community_xxx"` via `POST /api/feed/posts`
2. Verificar se o post foi salvo no banco com o `communityId` correto
3. Chamar `GET /api/communities/{communityId}/feed` e verificar a query
4. Verificar se o controller/filtro do feed da comunidade está usando o mesmo campo que o repository

**Sugestão de query (Spring Data JPA):**

```java
@Query("SELECT p FROM Post p WHERE p.communityId = :communityId ORDER BY p.createdAt DESC")
Page<Post> findByCommunityId(@Param("communityId") String communityId, Pageable pageable);
```

## 3. Members endpoint

**Endpoint:** `GET /api/communities/{communityId}/members`

Já implementado? Precisa retornar:

```json
{
  "items": [
    {
      "userId": "user_...",
      "username": "joao",
      "name": "João",
      "avatar": "https://...",
      "role": "ADMIN"
    }
  ]
}
```

O frontend usa `role` pra exibir badge ADMIN e permitir edição da comunidade.
