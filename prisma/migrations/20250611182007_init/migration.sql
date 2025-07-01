-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PAROISSIEN',
    "paroisseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "paroisses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "adresse" TEXT,
    "ville" TEXT,
    "codePostal" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "subdomain" TEXT NOT NULL,
    "configSite" JSONB,
    "templateId" TEXT NOT NULL DEFAULT 'default',
    "plan" TEXT NOT NULL DEFAULT 'GRATUIT',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "admin_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sectionsAutorisees" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "paroisseId" TEXT NOT NULL,
    "adminResponsable" TEXT,
    "contenu" JSONB,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sections_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "actualites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "image" TEXT,
    "paroisseId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "publiee" BOOLEAN NOT NULL DEFAULT false,
    "datePubli" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "actualites_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "actualites_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evenements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME,
    "lieu" TEXT,
    "paroisseId" TEXT NOT NULL,
    "sectionId" TEXT,
    "maxParticipants" INTEGER,
    "inscriptions" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "evenements_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "horaires" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typeOffice" TEXT NOT NULL,
    "jourSemaine" INTEGER NOT NULL,
    "heure" TEXT NOT NULL,
    "description" TEXT,
    "paroisseId" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "horaires_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sacrements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "contact" TEXT,
    "paroisseId" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sacrements_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "paroisses_subdomain_key" ON "paroisses"("subdomain");
