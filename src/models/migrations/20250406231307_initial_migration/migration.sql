-- CreateTable
CREATE TABLE "City" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stateId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CityPopulation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cityId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    CONSTRAINT "CityPopulation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Country" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "continent" TEXT NOT NULL,
    "currencyName" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "unicode" TEXT NOT NULL,
    "capital" TEXT NOT NULL,
    "flagSvg" TEXT NOT NULL,
    "dialCode" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CountryPopulation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "countryId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "CountryPopulation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "State" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "countryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "City_stateId_idx" ON "City"("stateId");

-- CreateIndex
CREATE INDEX "CityPopulation_cityId_idx" ON "CityPopulation"("cityId");

-- CreateIndex
CREATE INDEX "CountryPopulation_countryId_idx" ON "CountryPopulation"("countryId");

-- CreateIndex
CREATE INDEX "State_countryId_idx" ON "State"("countryId");
