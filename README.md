
# 🛍️ VendTout - Clone Vinted - Backend

**VendTout** est une marketplace complète inspirée de Vinted, permettant aux utilisateurs d'acheter, vendre et échanger des articles facilement. L'application inclut des fonctionnalités avancées comme **l'authentification, la publication d'annonce, le filtrage d'annonce, un système de favoris et un chat en temps réel**.

## 🚀 Démo en ligne
🔗 Site déployé : [vendtout.vercel.app](https://vendtout.vercel.app/)\
📹 Vidéo démo : [voir la vidéo démo](https://www.youtube.com/watch?v=MV_9-I8bRpU)
🎨 Repo frontend : [accéder au repo frontend](https://github.com/ThomasLebel/VendTout-Frontend)

## 🧱 Stack technique

| Frontend  | Backend | Base de données | Autres services |
| -------- |-------| ---------------| ---------------|
|Next.js 15|Node.js|MongoDB (Utilisateurs & annonces)| Cloudinary (Upload d'image)|
|React 19|Express.js|Firestore (Messagerie instantanée)| Vercel (Déploiement)|
|Typescript|Typescript||

## ⚙️ Fonctionnalités techniques
- **Express.js** : API REST pour gérer les annonces, utilisateurs, favoris, etc.
- **MongoDB + Mongoose** : base de données NoSQL avec schémas et validations.
- **Authentification sécurisée** :
  - Hash des mots de passe avec `bcryptjs`
  - Token d'identification via `uid2`
  - Cookies gérés avec `cookie-parser`
- **Gestion des fichiers** :
  - Uploads avec `express-fileupload`
  - Stockage des images via `Cloudinary`
- **Sécurité & performance** :
  - Variables d’environnement via `dotenv`
  - CORS configuré avec `cors`
  - Logs HTTP avec `morgan`
- **Test & Dev** :
  - **Jest** + **Supertest** pour les tests
  - **Nodemon** pour le rechargement auto en dev
  - **TypeScript** pour un code typé, compilé avec `tsc`
 
## ⚡ API Endpoints
---
### 🙋‍♂️ Routes Users
|Méthode|Route|Fonction|
|-------|-----|--------|
|`POST`|`/users/signup`|Inscription d'un utilisateur : génération d'un token + hashage du mot de passe.|
|`POST`|`/users/signin`|Connexion d'un utilisateur via pseudo ou email + mot de passe.|
|`GET`|`/users/:username`|Récupération des utilisateurs correspondants au pseudo reçu en paramètre|
|`GET`|`/users/profilePicture/:username`|Récupération de la photo de profil d'un utilisateur selon son pseudo|
|`PUT`|`/users/profile`|Modification de la bio / pays / ville + upload nouvel avatar sur cloudinary|
|`PUT`|`/users/info`|Modification du nom complet / genre / date de naissance|
|`PUT`|`/users/shippingAdress`|Modification de l'adresse de livraison|
|`PUT`|`/users/password`|Modification du mot de passe|
|`PUT`|`/users/email`|Modification de l'adresse mail|
|`GET`|`/users/favourites/:userToken`|Récupération des articles mis en favoris|
|`GET`|`/users/postedProducts/:username`|Récupération des articles actuellement en vente par un utilisateur|
|`DELETE`|`/users/delete`|Suppression d'un utilisateur|

### 👕 Routes Products
|Méthode|Route|Fonction|
|-------|-----|--------|
|`GET`|`/products/find/:page`|Récupération des derniers produits postés|
|`POST`|`/products/addItem`|Création d'une nouvelle annonce + upload des photos sur Cloudinary|
|`GET`|`/:id`|Récupération des informations d'une annonce selon son ID|
|`POST`|`/like`|Ajout / suppression d'un like sur une annonce|
|`POST`|`/filteredProducts`|Récupération des annonces correspondantes aux filtres reçus|
|`DELETE`|`/:id`|Suppression d'une annonce|

### 🛍 Routes Orders
|Méthode|Route|Fonction|
|-------|-----|--------|
|`POST`|`/orders/add`|Création d'une nouvelle commande|
|`PUT`|`/orders/productSent`|Modification du statut de la commande sur "Envoyé"|
|`PUT`|`/orders/productReceived`|Modification du statut de la commande sur "Terminé"|
|`GET`|`/orders/:userToken`|Récupération des commandes et ventes d'un utilisateur|

## 👨‍💻 Auteur
Thomas Lebel\
🔗 [Linkedin](https://www.linkedin.com/in/thomas-lebel-6047ba129/)\
📫Contact : thomas.lebel38@gmail.com


