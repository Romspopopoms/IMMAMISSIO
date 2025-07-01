-- CreateTable
CREATE TABLE "membres" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "photo" TEXT,
    "paroisseId" TEXT NOT NULL,
    "userId" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "membres_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "membres_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conseils" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "paroisseId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "conseils_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appartenances_conseils" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membreId" TEXT NOT NULL,
    "conseilId" TEXT NOT NULL,
    "fonction" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "appartenances_conseils_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appartenances_conseils_conseilId_fkey" FOREIGN KEY ("conseilId") REFERENCES "conseils" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "secteurs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "couleur" TEXT,
    "icone" TEXT,
    "paroisseId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "secteurs_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "responsabilites_secteurs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membreId" TEXT NOT NULL,
    "secteurId" TEXT NOT NULL,
    "fonction" TEXT NOT NULL DEFAULT 'Responsable',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "responsabilites_secteurs_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "responsabilites_secteurs_secteurId_fkey" FOREIGN KEY ("secteurId") REFERENCES "secteurs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pretres" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "fonction" TEXT NOT NULL,
    "photo" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "bio" TEXT,
    "paroisseId" TEXT NOT NULL,
    "userId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pretres_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pretres_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_pretres" ("actif", "bio", "createdAt", "email", "fonction", "id", "nom", "ordre", "paroisseId", "photo", "prenom", "telephone", "updatedAt") SELECT "actif", "bio", "createdAt", "email", "fonction", "id", "nom", "ordre", "paroisseId", "photo", "prenom", "telephone", "updatedAt" FROM "pretres";
DROP TABLE "pretres";
ALTER TABLE "new_pretres" RENAME TO "pretres";
CREATE UNIQUE INDEX "pretres_userId_key" ON "pretres"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "membres_userId_key" ON "membres"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "appartenances_conseils_membreId_conseilId_key" ON "appartenances_conseils"("membreId", "conseilId");

-- CreateIndex
CREATE UNIQUE INDEX "responsabilites_secteurs_membreId_secteurId_fonction_key" ON "responsabilites_secteurs"("membreId", "secteurId", "fonction");
