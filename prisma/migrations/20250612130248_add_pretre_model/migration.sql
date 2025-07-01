-- CreateTable
CREATE TABLE "pretres" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "fonction" TEXT NOT NULL,
    "photo" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "bio" TEXT,
    "paroisseId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pretres_paroisseId_fkey" FOREIGN KEY ("paroisseId") REFERENCES "paroisses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
