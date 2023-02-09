-- CreateTable
CREATE TABLE "SteamUserInformation" (
    "steamId" BIGINT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "avatar_small" TEXT NOT NULL,
    "avatar_medium" TEXT NOT NULL,
    "avatar_full" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "steamId" BIGINT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "User_steamId_fkey" FOREIGN KEY ("steamId") REFERENCES "SteamUserInformation" ("steamId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KOFIDonation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "manually_created" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "from_name" TEXT NOT NULL,
    "message" TEXT,
    "amount" REAL NOT NULL,
    "url" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "is_subscription_payment" BOOLEAN NOT NULL,
    "is_first_subscription_payment" BOOLEAN NOT NULL,
    "kofi_transaction_id" TEXT NOT NULL,
    "original_JSON" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserKOFIDonation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "donationId" INTEGER NOT NULL,
    "userId" BIGINT NOT NULL,
    CONSTRAINT "UserKOFIDonation_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "KOFIDonation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserKOFIDonation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("steamId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CostTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL
);
